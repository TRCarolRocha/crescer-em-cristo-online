
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Pastor João",
      role: "Pastor Principal",
      quote: "Esta plataforma tem revolucionado nosso discipulado. Conseguimos acompanhar cada membro de perto.",
      rating: 5
    },
    {
      name: "Irmã Maria",
      role: "Líder de Pequeno Grupo",
      quote: "As trilhas me ajudaram a crescer espiritualmente e agora posso discipular outras pessoas.",
      rating: 5
    },
    {
      name: "Irmão Carlos",
      role: "Novo Membro",
      quote: "Desde que cheguei na Monte Hebrom, essa ferramenta tem sido fundamental no meu crescimento.",
      rating: 5
    }
  ];

  return (
    <div className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Testemunhos da Nossa Igreja
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Veja como nossa plataforma tem impactado vidas na Monte Hebrom
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-blue-200 text-sm">{testimonial.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;
