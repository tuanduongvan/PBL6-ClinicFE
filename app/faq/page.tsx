'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useAuthContext } from '@/components/auth-provider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    category: 'Đặt lịch hẹn',
    questions: [
      {
        question: 'Làm thế nào để đặt lịch hẹn?',
        answer: 'Bạn có thể đặt lịch hẹn trực tuyến bằng cách chọn bác sĩ từ danh sách, chọn ngày và giờ phù hợp, sau đó điền thông tin cần thiết. Hệ thống sẽ gửi yêu cầu đến bác sĩ để xác nhận.',
      },
      {
        question: 'Tôi có thể hủy hoặc đổi lịch hẹn không?',
        answer: 'Có, bạn có thể hủy hoặc đổi lịch hẹn trong vòng 12 giờ trước giờ khám. Vui lòng vào trang "Lịch hẹn của tôi" để thực hiện thao tác này.',
      },
      {
        question: 'Lịch hẹn của tôi có được xác nhận ngay không?',
        answer: 'Không, lịch hẹn của bạn sẽ ở trạng thái "Đang chờ xác nhận" cho đến khi bác sĩ chấp nhận. Bạn sẽ nhận được thông báo khi lịch hẹn được xác nhận hoặc từ chối.',
      },
    ],
  },
  {
    category: 'Thanh toán',
    questions: [
      {
        question: 'Tôi có thể thanh toán trực tuyến không?',
        answer: 'Hiện tại chúng tôi đang phát triển tính năng thanh toán trực tuyến. Bạn có thể thanh toán tại phòng khám khi đến khám.',
      },
      {
        question: 'Giá khám bệnh là bao nhiêu?',
        answer: 'Giá khám bệnh tùy thuộc vào từng bác sĩ và loại dịch vụ. Bạn có thể xem giá trên trang thông tin của từng bác sĩ.',
      },
    ],
  },
  {
    category: 'Dịch vụ',
    questions: [
      {
        question: 'Phòng khám cung cấp những dịch vụ gì?',
        answer: 'Chúng tôi cung cấp các dịch vụ da liễu như điều trị mụn, chống lão hóa, phẫu thuật da, và chăm sóc phòng ngừa. Xem chi tiết tại trang "Dịch vụ".',
      },
      {
        question: 'Tôi có thể xem hồ sơ khám bệnh trực tuyến không?',
        answer: 'Có, sau mỗi lần khám, bác sĩ sẽ tạo hồ sơ khám bệnh và bạn có thể xem trong phần "Hồ sơ khám bệnh" trên tài khoản của mình.',
      },
    ],
  },
  {
    category: 'Tài khoản',
    questions: [
      {
        question: 'Làm thế nào để đăng ký tài khoản?',
        answer: 'Bạn có thể đăng ký bằng cách nhấn nút "Đăng ký" ở góc trên bên phải, điền thông tin cần thiết và xác nhận email.',
      },
      {
        question: 'Tôi quên mật khẩu, phải làm sao?',
        answer: 'Bạn có thể sử dụng tính năng "Quên mật khẩu" trên trang đăng nhập để đặt lại mật khẩu qua email.',
      },
    ],
  },
];

export default function FAQPage() {
  const { user, isLoggedIn, logout, openSignIn, openSignUp } = useAuthContext();

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
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                <HelpCircle className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4">
                Câu hỏi thường gặp
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Tìm câu trả lời cho các câu hỏi phổ biến về dịch vụ của chúng tôi
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="space-y-8">
            {faqs.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="border-2">
                <CardHeader>
                  <CardTitle className="text-2xl">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${categoryIndex}-${index}`}>
                        <AccordionTrigger className="text-left font-semibold">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact CTA */}
          <Card className="mt-12 bg-primary/5 border-primary/20">
            <CardContent className="pt-6 text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Không tìm thấy câu trả lời?
              </h3>
              <p className="text-muted-foreground mb-4">
                Liên hệ với chúng tôi để được hỗ trợ
              </p>
              <a
                href="/contact"
                className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Liên hệ ngay
              </a>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}

