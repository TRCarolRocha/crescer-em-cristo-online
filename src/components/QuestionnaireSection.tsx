
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  question_type: string;
  options?: any;
  correct_answer?: string | null;
  ordem: number;
}

interface UserResponse {
  question_id: string;
  response: string;
  is_correct?: boolean;
}

interface QuestionnaireSectionProps {
  contentId: string;
  onQuestionsCompleted: () => void;
  isCompleted: boolean;
}

const QuestionnaireSection: React.FC<QuestionnaireSectionProps> = ({ 
  contentId, 
  onQuestionsCompleted,
  isCompleted 
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [userResponses, setUserResponses] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchQuestions();
  }, [contentId]);

  useEffect(() => {
    if (user?.id && questions.length > 0) {
      fetchUserResponses();
    }
  }, [user, questions]);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('content_questions')
        .select('*')
        .eq('content_id', contentId)
        .order('ordem', { ascending: true });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserResponses = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_question_responses')
        .select('*')
        .eq('user_id', user.id)
        .in('question_id', questions.map(q => q.id));

      if (error) throw error;

      const responsesMap: Record<string, string> = {};
      const userResponsesData: UserResponse[] = [];

      data?.forEach(response => {
        responsesMap[response.question_id] = response.response;
        userResponsesData.push({
          question_id: response.question_id,
          response: response.response,
          is_correct: response.is_correct
        });
      });

      setResponses(responsesMap);
      setUserResponses(userResponsesData);
      setShowResults(data && data.length > 0);
    } catch (error) {
      console.error('Erro ao carregar respostas:', error);
    }
  };

  const handleResponseChange = (questionId: string, response: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: response
    }));
  };

  const handleSubmit = async () => {
    if (!user?.id) return;

    // Verificar se todas as perguntas foram respondidas
    const unansweredQuestions = questions.filter(q => !responses[q.id]?.trim());
    if (unansweredQuestions.length > 0) {
      toast({
        title: "Perguntas não respondidas",
        description: `Por favor, responda todas as ${questions.length} perguntas antes de continuar.`,
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const responsesToSave = questions.map(question => {
        const userResponse = responses[question.id];
        let isCorrect: boolean | null = null;

        // Avaliar resposta se há resposta correta definida
        if (question.correct_answer) {
          if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
            isCorrect = userResponse.toLowerCase().trim() === question.correct_answer.toLowerCase().trim();
          }
          // Para perguntas de texto, não avaliar automaticamente
        }

        return {
          user_id: user.id,
          question_id: question.id,
          response: userResponse,
          is_correct: isCorrect
        };
      });

      // Salvar respostas
      const { error } = await supabase
        .from('user_question_responses')
        .upsert(responsesToSave, {
          onConflict: 'user_id,question_id'
        });

      if (error) throw error;

      // Atualizar estado local
      setUserResponses(responsesToSave.map(r => ({
        question_id: r.question_id,
        response: r.response,
        is_correct: r.is_correct || undefined
      })));

      setShowResults(true);
      onQuestionsCompleted();

      toast({
        title: "Respostas enviadas",
        description: "Suas respostas foram salvas com sucesso!"
      });

    } catch (error) {
      console.error('Erro ao salvar respostas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar suas respostas",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getQuestionResult = (questionId: string) => {
    return userResponses.find(r => r.question_id === questionId);
  };

  const renderQuestion = (question: Question) => {
    const userResult = getQuestionResult(question.id);
    const isAnswered = showResults && !!userResult;

    // Parse options se for array JSON
    let questionOptions: string[] = [];
    if (question.options && typeof question.options === 'object') {
      if (Array.isArray(question.options)) {
        questionOptions = question.options;
      } else if (question.options && typeof question.options === 'object' && 'options' in question.options) {
        questionOptions = Array.isArray((question.options as any).options) ? (question.options as any).options : [];
      }
    }

    switch (question.question_type) {
      case 'multiple_choice':
        return (
          <div className="space-y-3">
            <RadioGroup
              value={responses[question.id] || ''}
              onValueChange={(value) => handleResponseChange(question.id, value)}
              disabled={isAnswered}
            >
              {questionOptions.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                  <Label htmlFor={`${question.id}-${index}`} className="flex-1">
                    {option}
                  </Label>
                  {isAnswered && question.correct_answer === option && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'true_false':
        return (
          <div className="space-y-3">
            <RadioGroup
              value={responses[question.id] || ''}
              onValueChange={(value) => handleResponseChange(question.id, value)}
              disabled={isAnswered}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Verdadeiro" id={`${question.id}-true`} />
                <Label htmlFor={`${question.id}-true`}>Verdadeiro</Label>
                {isAnswered && question.correct_answer === 'Verdadeiro' && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Falso" id={`${question.id}-false`} />
                <Label htmlFor={`${question.id}-false`}>Falso</Label>
                {isAnswered && question.correct_answer === 'Falso' && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </div>
            </RadioGroup>
          </div>
        );

      case 'text':
      default:
        return (
          <Textarea
            value={responses[question.id] || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Digite sua resposta aqui..."
            rows={4}
            disabled={isAnswered}
            className="resize-none"
          />
        );
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse flex items-center justify-center">
            <HelpCircle className="h-6 w-6 text-gray-400 mr-2" />
            <span className="text-gray-600">Carregando questionário...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <HelpCircle className="h-5 w-5" />
            Questionário de Verificação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <AlertCircle className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
            <p className="text-gray-600">
              Nenhuma pergunta foi cadastrada para este conteúdo ainda.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              O questionário será disponibilizado em breve.
            </p>
          </div>
          {!isCompleted && (
            <div className="text-center mt-4">
              <Button onClick={onQuestionsCompleted} variant="outline">
                Marcar como Concluído
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <HelpCircle className="h-5 w-5" />
            Questionário de Verificação
          </CardTitle>
          {isCompleted && (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Concluído
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((question, index) => {
          const userResult = getQuestionResult(question.id);
          const isCorrect = userResult?.is_correct;

          return (
            <div key={question.id} className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">
                  {index + 1}
                </Badge>
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-gray-900">{question.question}</p>
                    {showResults && isCorrect !== undefined && (
                      <div className="flex-shrink-0">
                        {isCorrect ? (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Correto
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Incorreto
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  {renderQuestion(question)}
                </div>
              </div>
            </div>
          );
        })}

        {!showResults && (
          <div className="pt-4 border-t">
            <Button 
              onClick={handleSubmit} 
              disabled={submitting}
              className="w-full"
            >
              {submitting ? 'Enviando respostas...' : 'Enviar Respostas'}
            </Button>
          </div>
        )}

        {showResults && (
          <div className="pt-4 border-t bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Questionário concluído!</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Suas respostas foram salvas. Você pode revisar suas respostas acima.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionnaireSection;
