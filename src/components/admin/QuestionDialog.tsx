
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Trash, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  question: string;
  question_type: string;
  options?: any;
  correct_answer?: string | null;
  ordem: number;
}

interface QuestionDialogProps {
  contentId: string;
  contentTitle: string;
  onClose: () => void;
}

const QuestionDialog: React.FC<QuestionDialogProps> = ({ contentId, contentTitle, onClose }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    question: '',
    question_type: 'text',
    options: ['', ''],
    correct_answer: '',
    ordem: 1
  });

  useEffect(() => {
    fetchQuestions();
  }, [contentId]);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('content_questions')
        .select('*')
        .eq('content_id', contentId)
        .order('ordem');

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Erro ao buscar perguntas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as perguntas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.question.trim()) return;

    try {
      const questionData = {
        content_id: contentId,
        question: formData.question,
        question_type: formData.question_type,
        options: formData.question_type === 'multiple_choice' ? 
          { options: formData.options.filter(opt => opt.trim()) } : null,
        correct_answer: formData.correct_answer || null,
        ordem: formData.ordem
      };

      if (editingQuestion) {
        const { error } = await supabase
          .from('content_questions')
          .update(questionData)
          .eq('id', editingQuestion.id);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Pergunta atualizada!" });
      } else {
        const { error } = await supabase
          .from('content_questions')
          .insert(questionData);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Pergunta criada!" });
      }

      resetForm();
      fetchQuestions();
    } catch (error) {
      console.error('Erro ao salvar pergunta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a pergunta",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm('Deseja excluir esta pergunta?')) return;

    try {
      const { error } = await supabase
        .from('content_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;
      
      toast({ title: "Sucesso", description: "Pergunta excluída!" });
      fetchQuestions();
    } catch (error) {
      console.error('Erro ao excluir pergunta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a pergunta",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      question_type: 'text',
      options: ['', ''],
      correct_answer: '',
      ordem: questions.length + 1
    });
    setEditingQuestion(null);
    setShowForm(false);
  };

  const startEdit = (question: Question) => {
    setEditingQuestion(question);
    
    let options = ['', ''];
    if (question.options && typeof question.options === 'object' && question.options.options) {
      options = question.options.options;
    }

    setFormData({
      question: question.question,
      question_type: question.question_type,
      options: options,
      correct_answer: question.correct_answer || '',
      ordem: question.ordem
    });
    setShowForm(true);
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, '']
    });
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData({
        ...formData,
        options: formData.options.filter((_, i) => i !== index)
      });
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({
      ...formData,
      options: newOptions
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Perguntas - {contentTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lista de perguntas */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Perguntas Cadastradas</h3>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Pergunta
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-4">Carregando...</div>
            ) : questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma pergunta cadastrada ainda
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((question, index) => (
                  <Card key={question.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{index + 1}</Badge>
                            <Badge variant="secondary">{question.question_type}</Badge>
                          </div>
                          <p className="font-medium mb-2">{question.question}</p>
                          
                          {question.question_type === 'multiple_choice' && question.options && (
                            <div className="text-sm text-gray-600">
                              <strong>Opções:</strong> {
                                Array.isArray(question.options.options) ? 
                                question.options.options.join(', ') : 
                                'N/A'
                              }
                            </div>
                          )}
                          
                          {question.correct_answer && (
                            <div className="text-sm text-green-600 mt-1">
                              <strong>Resposta correta:</strong> {question.correct_answer}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(question)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(question.id)}
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Formulário */}
          {showForm && (
            <Card className="border-2 border-blue-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    {editingQuestion ? 'Editar Pergunta' : 'Nova Pergunta'}
                  </h3>
                  <Button variant="ghost" size="sm" onClick={resetForm}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="question">Pergunta</Label>
                    <Textarea
                      id="question"
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      placeholder="Digite a pergunta..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Tipo da Pergunta</Label>
                      <Select
                        value={formData.question_type}
                        onValueChange={(value) => setFormData({ ...formData, question_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Texto Livre</SelectItem>
                          <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                          <SelectItem value="true_false">Verdadeiro/Falso</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="ordem">Ordem</Label>
                      <Input
                        id="ordem"
                        type="number"
                        min="1"
                        value={formData.ordem}
                        onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                  </div>

                  {formData.question_type === 'multiple_choice' && (
                    <div>
                      <Label>Opções de Resposta</Label>
                      <div className="space-y-2 mt-2">
                        {formData.options.map((option, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={option}
                              onChange={(e) => updateOption(index, e.target.value)}
                              placeholder={`Opção ${index + 1}`}
                            />
                            {formData.options.length > 2 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeOption(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addOption}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Opção
                        </Button>
                      </div>
                    </div>
                  )}

                  {(formData.question_type === 'multiple_choice' || formData.question_type === 'true_false') && (
                    <div>
                      <Label htmlFor="correct_answer">Resposta Correta (opcional)</Label>
                      {formData.question_type === 'true_false' ? (
                        <Select
                          value={formData.correct_answer}
                          onValueChange={(value) => setFormData({ ...formData, correct_answer: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a resposta correta" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Verdadeiro">Verdadeiro</SelectItem>
                            <SelectItem value="Falso">Falso</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id="correct_answer"
                          value={formData.correct_answer}
                          onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                          placeholder="Digite a resposta correta..."
                        />
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave}>
                      {editingQuestion ? 'Atualizar' : 'Criar'} Pergunta
                    </Button>
                    <Button variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionDialog;
