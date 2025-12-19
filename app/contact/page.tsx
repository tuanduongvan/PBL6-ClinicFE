'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useAuthContext } from '@/components/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ContactPage() {
  const { user, isLoggedIn, logout, openSignIn, openSignUp } = useAuthContext();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: 'Thành công',
        description: 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.',
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header 
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={logout}
        onSignIn={openSignIn}
        onSignUp={openSignUp}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-primary/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4">
                Liên hệ với chúng tôi
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi qua bất kỳ cách nào bạn thấy thuận tiện.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information & Form */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Thông tin liên hệ
                </h2>
                <div className="space-y-4">
                  <Card>
                    <CardContent className="flex items-start gap-4 p-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg mb-1">Địa chỉ</CardTitle>
                        <CardDescription>
                          123 Đường ABC, Quận XYZ<br />
                          Thành phố Hồ Chí Minh, Việt Nam
                        </CardDescription>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="flex items-start gap-4 p-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg mb-1">Điện thoại</CardTitle>
                        <CardDescription>
                          <a href="tel:+84123456789" className="hover:text-primary">
                            +84 123 456 789
                          </a>
                          <br />
                          <a href="tel:+84987654321" className="hover:text-primary">
                            +84 987 654 321
                          </a>
                        </CardDescription>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="flex items-start gap-4 p-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg mb-1">Email</CardTitle>
                        <CardDescription>
                          <a href="mailto:info@dermaclinic.com" className="hover:text-primary">
                            info@dermaclinic.com
                          </a>
                          <br />
                          <a href="mailto:support@dermaclinic.com" className="hover:text-primary">
                            support@dermaclinic.com
                          </a>
                        </CardDescription>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="flex items-start gap-4 p-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg mb-1">Giờ làm việc</CardTitle>
                        <CardDescription>
                          Thứ 2 - Thứ 6: 8:00 - 17:00<br />
                          Thứ 7: 8:00 - 12:00<br />
                          Chủ nhật: Nghỉ
                        </CardDescription>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Gửi tin nhắn cho chúng tôi
              </h2>
              <Card>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Họ và tên *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Nhập họ và tên của bạn"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-2">
                        Số điện thoại
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="0123 456 789"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium mb-2">
                        Chủ đề *
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder="Nhập chủ đề"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2">
                        Tin nhắn *
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder="Nhập tin nhắn của bạn..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        'Đang gửi...'
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Gửi tin nhắn
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

