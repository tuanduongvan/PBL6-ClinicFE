'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { 
  MessageSquare, 
  X, 
  Send, 
  Loader2, 
  User, 
  Bot,
  Minimize2,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { datetimeExtractionAPI } from '@/services/api/datetime-extraction'
import { doctorsApi } from '@/services/api/doctors'
import { specialitiesAPI, Speciality } from '@/services/api/specialities'
import { Doctor } from '@/types/doctor'
import { appointmentsAPI } from '@/services/api/appointments'
import { format } from 'date-fns'

type BookingStep = 
  | 'greeting' 
  | 'select_specialty' 
  | 'select_doctor' 
  | 'select_date' 
  | 'select_time' 
  | 'confirm' 
  | 'submitting' 
  | 'completed'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  type?: 'text' | 'info' | 'error' | 'greeting'
  actions?: ActionChip[]
  doctors?: Doctor[]
  specialities?: Speciality[]
  selectedDate?: Date
  availableSlots?: string[]
}

interface ActionChip {
  label: string
  action: () => void
  variant?: 'default' | 'outline' | 'secondary'
}

interface BookingData {
  specialtyId?: number
  doctorId?: number
  date?: string
  time?: string
  notes?: string
}

// Typing Indicator Component
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-muted/50 rounded-2xl rounded-tl-sm max-w-fit">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:0ms]" />
        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:150ms]" />
        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  )
}

// Doctor Card Component
function DoctorCard({ 
  doctor, 
  onSelect 
}: { 
  doctor: Doctor
  onSelect: () => void 
}) {
  const doctorName = doctor.user?.first_name && doctor.user?.last_name
    ? `${doctor.user.first_name} ${doctor.user.last_name}`
    : doctor.first_name && doctor.last_name
    ? `${doctor.first_name} ${doctor.last_name}`
    : 'Dr. Unknown'

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/50 border-2"
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarImage 
              src={doctor.user?.avatar || doctor.avatar || undefined} 
              alt={doctorName}
            />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {doctorName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-semibold text-sm leading-tight">
                BS. {doctorName}
              </h4>
              {doctor.rating && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium">{doctor.rating}</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {doctor.price && (
                <Badge variant="secondary" className="text-xs">
                  {doctor.price.toLocaleString('vi-VN')} đ
                </Badge>
              )}
              {doctor.experience && (
                <span className="text-xs text-muted-foreground">
                  {doctor.experience} năm KN
                </span>
              )}
              {doctor.is_available && (
                <Badge variant="outline" className="text-xs border-green-500/50 text-green-700 dark:text-green-400">
                  Có lịch trống
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Specialty Chip Component
function SpecialtyChip({ 
  specialty, 
  onSelect 
}: { 
  specialty: Speciality
  onSelect: () => void 
}) {
  return (
    <Button
      variant="outline"
      className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-primary/5 hover:border-primary/50 transition-colors"
      onClick={onSelect}
    >
      <div className="flex flex-col items-start gap-1">
        <span className="font-medium text-sm">{specialty.name}</span>
        {specialty.description && (
          <span className="text-xs text-muted-foreground line-clamp-1">
            {specialty.description}
          </span>
        )}
      </div>
    </Button>
  )
}

export function BookingChatbot() {
  const { user, isLoggedIn } = useAuth()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [currentStep, setCurrentStep] = useState<BookingStep>('greeting')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [bookingData, setBookingData] = useState<BookingData>({})
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const messageIdCounter = useRef(0)

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current && isOpen) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        setTimeout(() => {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: 'smooth'
          })
        }, 100)
      }
    }
  }, [messages, isOpen])

  // Initialize greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      messageIdCounter.current += 1
      const greetingMessage: Message = {
        id: `msg-greeting-${Date.now()}`,
        text: isLoggedIn 
          ? 'Xin chào! Tôi là trợ lý đặt lịch của Derma Clinic. Tôi có thể giúp bạn đặt lịch khám một cách nhanh chóng và dễ dàng.'
          : 'Xin chào! Để đặt lịch khám, vui lòng đăng nhập trước.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'greeting',
        actions: isLoggedIn ? [
          {
            label: '📅 Đặt lịch ngay',
            action: () => handleBookNow(),
            variant: 'default'
          }
        ] : []
      }
      setMessages([greetingMessage])
    }
  }, [isOpen, isLoggedIn])

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    messageIdCounter.current += 1
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}-${messageIdCounter.current}`,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, newMessage])
  }

  const showTypingIndicator = () => {
    setIsLoading(true)
  }

  const hideTypingIndicator = () => {
    setIsLoading(false)
  }

  const handleBookNow = async () => {
    if (!isLoggedIn) {
      addMessage({
        text: 'Vui lòng đăng nhập để tiếp tục đặt lịch.',
        sender: 'bot',
        type: 'error'
      })
      return
    }

    setCurrentStep('select_specialty')
    showTypingIndicator()

    // Simulate typing delay
    setTimeout(async () => {
      try {
        const specialities = await specialitiesAPI.getAll()
        hideTypingIndicator()

        if (specialities.length === 0) {
          addMessage({
            text: 'Hiện tại không có chuyên khoa nào. Vui lòng thử lại sau.',
            sender: 'bot',
            type: 'error'
          })
          return
        }

        addMessage({
          text: 'Vui lòng chọn chuyên khoa bạn muốn khám:',
          sender: 'bot',
          type: 'text',
          specialities
        })
      } catch (error) {
        hideTypingIndicator()
        addMessage({
          text: 'Đã có lỗi xảy ra khi tải danh sách chuyên khoa. Vui lòng thử lại.',
          sender: 'bot',
          type: 'error'
        })
      }
    }, 1000)
  }

  const handleSelectSpecialty = async (specialty: Speciality) => {
    setBookingData(prev => ({ ...prev, specialtyId: specialty.id }))
    setCurrentStep('select_doctor')
    showTypingIndicator()

    addMessage({
      text: `Đã chọn: ${specialty.name}`,
      sender: 'user',
      type: 'text'
    })

    setTimeout(async () => {
      try {
        const allDoctors = await doctorsApi.getAll()
        const filteredDoctors = allDoctors.filter(
          doctor => doctor.specialty === specialty.id && doctor.is_available
        )
        hideTypingIndicator()

        if (filteredDoctors.length === 0) {
          addMessage({
            text: `Không tìm thấy bác sĩ nào thuộc chuyên khoa ${specialty.name}. Vui lòng chọn chuyên khoa khác.`,
            sender: 'bot',
            type: 'error',
            actions: [
              {
                label: 'Chọn lại chuyên khoa',
                action: () => {
                  setCurrentStep('select_specialty')
                  handleBookNow()
                },
                variant: 'outline'
              }
            ]
          })
          return
        }

        addMessage({
          text: `Tìm thấy ${filteredDoctors.length} bác sĩ. Vui lòng chọn một bác sĩ:`,
          sender: 'bot',
          type: 'text',
          doctors: filteredDoctors
        })
      } catch (error) {
        hideTypingIndicator()
        addMessage({
          text: 'Đã có lỗi xảy ra khi tải danh sách bác sĩ. Vui lòng thử lại.',
          sender: 'bot',
          type: 'error'
        })
      }
    }, 1000)
  }

  const handleSelectDoctor = async (doctor: Doctor) => {
    setBookingData(prev => ({ ...prev, doctorId: doctor.id }))
    setCurrentStep('select_date')

    const doctorName = doctor.user?.first_name && doctor.user?.last_name
      ? `${doctor.user.first_name} ${doctor.user.last_name}`
      : 'Bác sĩ'

    addMessage({
      text: `Đã chọn: BS. ${doctorName}`,
      sender: 'user',
      type: 'text'
    })

    showTypingIndicator()
    setTimeout(() => {
      hideTypingIndicator()
      addMessage({
        text: 'Vui lòng chọn ngày khám:',
        sender: 'bot',
        type: 'text',
        selectedDate: new Date()
      })
    }, 800)
  }

  const handleDateSelect = async (date: Date | undefined) => {
    if (!date) return

    setSelectedDate(date)
    const dateString = format(date, 'yyyy-MM-dd')
    setBookingData(prev => ({ ...prev, date: dateString }))
    setCurrentStep('select_time')

    addMessage({
      text: `Đã chọn ngày: ${format(date, 'dd/MM/yyyy')}`,
      sender: 'user',
      type: 'text'
    })

    if (!bookingData.doctorId) {
      addMessage({
        text: 'Lỗi: Chưa chọn bác sĩ. Vui lòng bắt đầu lại.',
        sender: 'bot',
        type: 'error'
      })
      return
    }

    showTypingIndicator()
    setTimeout(async () => {
      try {
        const slots = await appointmentsAPI.getAvailableSlots(
          bookingData.doctorId!,
          dateString
        )
        hideTypingIndicator()

        if (slots.length === 0) {
          addMessage({
            text: 'Không có khung giờ trống vào ngày này. Vui lòng chọn ngày khác.',
            sender: 'bot',
            type: 'error',
            actions: [
              {
                label: 'Chọn lại ngày',
                action: () => {
                  setCurrentStep('select_date')
                  setSelectedDate(undefined)
                  setBookingData(prev => ({ ...prev, date: undefined }))
                },
                variant: 'outline'
              }
            ]
          })
          return
        }

        addMessage({
          text: 'Vui lòng chọn khung giờ:',
          sender: 'bot',
          type: 'text',
          availableSlots: slots
        })
      } catch (error) {
        hideTypingIndicator()
        addMessage({
          text: 'Đã có lỗi xảy ra khi tải khung giờ. Vui lòng thử lại.',
          sender: 'bot',
          type: 'error'
        })
      }
    }, 1000)
  }

  const handleTimeSelect = (time: string) => {
    setBookingData(prev => ({ ...prev, time }))
    setCurrentStep('confirm')

    addMessage({
      text: `Đã chọn giờ: ${time.slice(0, 5)}`,
      sender: 'user',
      type: 'text'
    })

    showTypingIndicator()
    setTimeout(() => {
      hideTypingIndicator()
      const timeDisplay = time.slice(0, 5)
      addMessage({
        text: `Xác nhận thông tin đặt lịch:\n\n📅 Ngày: ${format(new Date(bookingData.date!), 'dd/MM/yyyy')}\n🕐 Giờ: ${timeDisplay}\n👨‍⚕️ Bác sĩ: Đã chọn\n\nThông tin này có chính xác không?`,
        sender: 'bot',
        type: 'info',
        actions: [
          {
            label: '✅ Xác nhận',
            action: handleConfirm,
            variant: 'default'
          },
          {
            label: '❌ Hủy',
            action: handleReset,
            variant: 'outline'
          }
        ]
      })
    }, 800)
  }

  const handleConfirm = async () => {
    if (!bookingData.doctorId || !bookingData.date || !bookingData.time) {
      addMessage({
        text: 'Thiếu thông tin đặt lịch. Vui lòng bắt đầu lại.',
        sender: 'bot',
        type: 'error'
      })
      return
    }

    setCurrentStep('submitting')
    addMessage({
      text: 'Xác nhận',
      sender: 'user',
      type: 'text'
    })

    showTypingIndicator()
    setTimeout(async () => {
      try {
        const appointment = await appointmentsAPI.create({
          doctor_id: bookingData.doctorId!,
          date: bookingData.date!,
          time: bookingData.time!,
          notes: bookingData.notes
        })

        hideTypingIndicator()
        setCurrentStep('completed')

        addMessage({
          text: `✅ Đặt lịch thành công!\n\nLịch hẹn của bạn đang chờ bác sĩ xác nhận. Bạn sẽ nhận được thông báo khi có cập nhật.`,
          sender: 'bot',
          type: 'info'
        })

        toast({
          title: 'Đặt lịch thành công',
          description: 'Lịch hẹn của bạn đang chờ bác sĩ xác nhận.',
        })

        // Reset after 3 seconds
        setTimeout(() => {
          handleReset()
        }, 3000)
      } catch (error: any) {
        hideTypingIndicator()
        const errorMessage = error?.response?.data?.detail || error?.message || 'Đã có lỗi xảy ra khi đặt lịch. Vui lòng thử lại.'
        addMessage({
          text: errorMessage,
          sender: 'bot',
          type: 'error',
          actions: [
            {
              label: 'Thử lại',
              action: () => {
                setCurrentStep('confirm')
                handleConfirm()
              },
              variant: 'outline'
            },
            {
              label: 'Bắt đầu lại',
              action: handleReset,
              variant: 'outline'
            }
          ]
        })
      }
    }, 1500)
  }

  const handleReset = () => {
    setMessages([])
    setCurrentStep('greeting')
    setBookingData({})
    setSelectedDate(undefined)
    setIsLoading(false)
    messageIdCounter.current = 0
  }

  const handleSend = () => {
    const text = inputText.trim()
    if (!text || isLoading || !isLoggedIn) return

    addMessage({
      text,
      sender: 'user',
      type: 'text'
    })
    setInputText('')

    // Handle text input for date/time extraction if needed
    if (currentStep === 'select_date' || currentStep === 'select_time') {
      // Try to extract datetime from text
      datetimeExtractionAPI.extract(text)
        .then(response => {
          if (response.extracted?.date && response.extracted?.time) {
            const date = new Date(response.extracted.date)
            handleDateSelect(date)
            setTimeout(() => {
              handleTimeSelect(response.extracted!.time)
            }, 500)
          }
        })
        .catch(() => {
          // If extraction fails, just show error
          addMessage({
            text: 'Vui lòng sử dụng các nút bên dưới để chọn ngày và giờ.',
            sender: 'bot',
            type: 'error'
          })
        })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Closed state - show trigger button
  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        aria-label="Mở chatbot đặt lịch"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    )
  }

  // Open state - show chat window
  return (
    <Card className={cn(
      "fixed bottom-4 right-4 w-[90vw] sm:w-[400px] lg:w-[480px] h-[600px] max-h-[85vh] z-[60] flex flex-col shadow-2xl border-2 overflow-hidden",
      isMinimized && "h-auto"
    )}>
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground p-4 flex items-center justify-between border-b border-primary/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-primary-foreground/20">
              <AvatarFallback className="bg-primary-foreground/20">
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Trợ lý đặt lịch</h3>
            <p className="text-xs opacity-90">Đang hoạt động</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsOpen(false)
              handleReset()
            }}
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300',
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.sender === 'bot' && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className="flex flex-col gap-2 max-w-[80%]">
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-2.5',
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : message.type === 'error'
                          ? 'bg-destructive/10 text-destructive border border-destructive/20 rounded-tl-sm'
                          : 'bg-muted/50 text-foreground rounded-tl-sm'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.text}
                      </p>
                    </div>

                    {/* Action Chips */}
                    {message.actions && message.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {message.actions.map((action, idx) => (
                          <Button
                            key={idx}
                            variant={action.variant || 'default'}
                            size="sm"
                            onClick={action.action}
                            className="text-xs h-auto py-2 px-3"
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Specialities List */}
                    {message.specialities && message.specialities.length > 0 && (
                      <div className="space-y-2">
                        {message.specialities.map((specialty) => (
                          <SpecialtyChip
                            key={specialty.id}
                            specialty={specialty}
                            onSelect={() => handleSelectSpecialty(specialty)}
                          />
                        ))}
                      </div>
                    )}

                    {/* Doctors List */}
                    {message.doctors && message.doctors.length > 0 && (
                      <div className="space-y-2">
                        {message.doctors.map((doctor) => (
                          <DoctorCard
                            key={doctor.id}
                            doctor={doctor}
                            onSelect={() => handleSelectDoctor(doctor)}
                          />
                        ))}
                      </div>
                    )}

                    {/* Calendar Picker */}
                    {currentStep === 'select_date' && message.selectedDate && (
                      <div className="bg-background border rounded-lg p-2">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateSelect}
                          disabled={(date) => date < new Date()}
                          className="rounded-md"
                        />
                      </div>
                    )}

                    {/* Time Slots */}
                    {message.availableSlots && message.availableSlots.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {message.availableSlots.map((slot, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            onClick={() => handleTimeSelect(slot)}
                            className="text-xs"
                          >
                            {slot.slice(0, 5)}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>

                  {message.sender === 'user' && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <TypingIndicator />
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          {currentStep !== 'completed' && (
            <div className="p-4 border-t bg-muted/30">
              {!isLoggedIn && (
                <div className="mb-3 p-3 bg-muted rounded-lg text-sm text-center">
                  <p className="text-muted-foreground mb-2">
                    Vui lòng đăng nhập để đặt lịch
                  </p>
                  <Button
                    size="sm"
                    onClick={() => window.location.href = '/?signin=true'}
                  >
                    Đăng nhập
                  </Button>
                </div>
              )}

              {isLoggedIn && (
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      currentStep === 'select_date' 
                        ? "Hoặc nhập ngày (VD: 26/12/2025)..."
                        : currentStep === 'select_time'
                        ? "Hoặc nhập giờ (VD: 9:30)..."
                        : "Nhập tin nhắn..."
                    }
                    disabled={isLoading || !isLoggedIn}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!inputText.trim() || isLoading || !isLoggedIn}
                    size="icon"
                    className="flex-shrink-0"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Card>
  )
}
