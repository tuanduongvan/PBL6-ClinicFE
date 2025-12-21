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
  Star,
  Calendar as CalendarIcon,
  ExternalLink,
  Clock,
  CheckCircle2,
  Bell,
  Stethoscope
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthContext } from '@/components/auth-provider'
import { useToast } from '@/hooks/use-toast'
import { datetimeExtractionAPI } from '@/services/api/datetime-extraction'
import { doctorsApi } from '@/services/api/doctors'
import { specialitiesAPI, Speciality } from '@/services/api/specialities'
import { Doctor } from '@/types/doctor'
import { appointmentsAPI } from '@/services/api/appointments'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

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
  text: string | React.ReactNode
  sender: 'user' | 'bot'
  timestamp: Date
  type?: 'text' | 'info' | 'error' | 'greeting' | 'datetime_confirmation' | 'final_confirmation'
  actions?: ActionChip[]
  doctors?: Doctor[]
  specialities?: Speciality[]
  selectedDate?: Date
  availableSlots?: string[]
  extractedDateTime?: {
    date: string
    time: string
    parsedDate?: Date
  }
  confirmationData?: {
    date: string
    time: string
    doctorName: string
    specialtyName: string
  }
  exampleTexts?: string[]
}

interface ActionChip {
  label: string | React.ReactNode
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
  const router = useRouter()
  const doctorName = doctor.user?.first_name && doctor.user?.last_name
    ? `${doctor.user.first_name} ${doctor.user.last_name}`
    : doctor.first_name && doctor.last_name
    ? `${doctor.first_name} ${doctor.last_name}`
    : 'Dr. Unknown'

  const handleBookAppointment = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect()
  }

  const handleViewPortfolio = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/doctors/${doctor.id}`)
  }

  return (
    <Card 
      className="hover:shadow-md transition-all duration-200 hover:border-primary/50 border-2 min-w-0"
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3 min-w-0">
          <Avatar className="h-12 w-12 border-2 border-primary/20 flex-shrink-0">
            <AvatarImage 
              src={doctor.user?.avatar || doctor.avatar || undefined} 
              alt={doctorName}
            />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {doctorName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1 min-w-0">
              <h4 className="font-semibold text-sm leading-tight break-words min-w-0" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                BS. {doctorName}
              </h4>
              {doctor.rating && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium">{doctor.rating}</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2 mb-3 min-w-0">
              {doctor.price && (
                <Badge variant="secondary" className="text-xs break-words">
                  {doctor.price.toLocaleString('vi-VN')} đ
                </Badge>
              )}
              {doctor.experience && (
                <span className="text-xs text-muted-foreground break-words">
                  {doctor.experience} năm KN
                </span>
              )}
              {doctor.is_available && (
                <Badge variant="outline" className="text-xs border-green-500/50 text-green-700 dark:text-green-400 break-words">
                  Có lịch trống
                </Badge>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={handleBookAppointment}
                className="flex-1 text-xs h-8"
              >
                <CalendarIcon className="w-3 h-3 mr-1.5" />
                Đặt lịch
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleViewPortfolio}
                className="flex-1 text-xs h-8"
              >
                <ExternalLink className="w-3 h-3 mr-1.5" />
                Xem portfolio
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// DateTime Confirmation Card Component
function DateTimeConfirmationCard({
  extractedDateTime,
  onConfirm,
  onCancel
}: {
  extractedDateTime: {
    date: string
    time: string
    parsedDate?: Date
  }
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Card className="border-2 border-primary/50 bg-primary/5 min-w-0 max-w-full">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm mb-2 text-foreground">Thông tin đã nhận diện:</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground">
                  <strong>Ngày:</strong> {extractedDateTime.date}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground">
                  <strong>Giờ:</strong> {extractedDateTime.time}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={onConfirm}
              className="flex-1 text-xs h-8"
            >
              <CheckCircle2 className="w-3 h-3 mr-1.5" />
              Xác nhận
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onCancel}
              className="flex-1 text-xs h-8"
            >
              <X className="w-3 h-3 mr-1.5" />
              Hủy
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Final Confirmation Card Component
function FinalConfirmationCard({
  confirmationData,
  onConfirm,
  onCancel
}: {
  confirmationData: {
    date: string
    time: string
    doctorName: string
    specialtyName: string
  }
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Card className="border-2 border-primary/50 bg-primary/5 min-w-0 max-w-full">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm mb-2 text-foreground">Xác nhận thông tin đặt lịch:</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground">
                  <strong>Ngày:</strong> {confirmationData.date}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground">
                  <strong>Giờ:</strong> {confirmationData.time}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground">
                  <strong>Bác sĩ:</strong> {confirmationData.doctorName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground">
                  <strong>Chuyên khoa:</strong> {confirmationData.specialtyName}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={onConfirm}
              className="flex-1 text-xs h-8"
            >
              <CheckCircle2 className="w-3 h-3 mr-1.5" />
              Xác nhận đặt lịch
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onCancel}
              className="flex-1 text-xs h-8"
            >
              <X className="w-3 h-3 mr-1.5" />
              Hủy
            </Button>
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
      className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-primary/5 hover:border-primary/50 transition-colors min-w-0 max-w-full"
      onClick={onSelect}
    >
      <div className="flex flex-col items-start gap-1 min-w-0 w-full max-w-full">
        <span className="font-medium text-sm break-words w-full" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{specialty.name}</span>
        {specialty.description && (
          <span className="text-xs text-muted-foreground break-words w-full whitespace-normal" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
            {specialty.description}
          </span>
        )}
      </div>
    </Button>
  )
}

export function BookingChatbot() {
  const { user, isLoggedIn } = useAuthContext()
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
    if (scrollAreaRef.current && isOpen && !isMinimized) {
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
  }, [messages, isOpen, isMinimized])

  // Initialize greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      messageIdCounter.current += 1
      const exampleTexts = [
        'Đặt lịch khám vào ngày 26/12/2025 lúc 9:00',
        'Tôi muốn đặt lịch ngày 15/01/2026 lúc 14:30',
        'Đặt hẹn ngày 20/02/2026 lúc 10:00'
      ]
      
      const greetingMessage: Message = {
        id: `msg-greeting-${Date.now()}`,
        text: isLoggedIn 
          ? 'Xin chào! Tôi sẽ giúp bạn đặt lịch nhanh hơn. Bạn có thể nhập thông tin đặt lịch theo các ví dụ sau:'
          : 'Xin chào! Để đặt lịch khám, vui lòng đăng nhập trước.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'greeting',
        exampleTexts: isLoggedIn ? exampleTexts : undefined,
        actions: isLoggedIn ? [] : []
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

  const handleConfirmDateTime = (extractedDateTime: { date: string; time: string; parsedDate?: Date }) => {
    // Save extracted datetime to bookingData
    if (extractedDateTime.parsedDate) {
      const dateString = format(extractedDateTime.parsedDate, 'yyyy-MM-dd')
      // Format time to HH:MM:SS format
      let timeString = extractedDateTime.time
      if (timeString.split(':').length === 2) {
        const [hours, minutes] = timeString.split(':')
        timeString = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`
      }
      
      setBookingData(prev => ({ 
        ...prev, 
        date: dateString,
        time: timeString
      }))
      setSelectedDate(extractedDateTime.parsedDate)
    }

    // Move to specialty selection
    setCurrentStep('select_specialty')
    showTypingIndicator()

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
          text: `Đã xác nhận: Ngày ${extractedDateTime.date}, Giờ ${extractedDateTime.time}. Vui lòng chọn chuyên khoa bạn muốn khám:`,
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

  const handleCancelDateTime = () => {
    setCurrentStep('greeting')
    setBookingData({})
    setSelectedDate(undefined)
    addMessage({
      text: 'Đã hủy. Bạn có thể nhập lại thông tin đặt lịch.',
      sender: 'bot',
      type: 'text'
    })
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
        // Filter by specialty and availability
        let filteredDoctors = allDoctors.filter(
          doctor => doctor.specialty === specialty.id && doctor.is_available
        )

        // If we have a date from datetime extraction, filter doctors by available slots
        if (bookingData.date && filteredDoctors.length > 0) {
          addMessage({
            text: `Đang kiểm tra lịch làm việc của các bác sĩ vào ngày ${format(new Date(bookingData.date), 'dd/MM/yyyy')}...`,
            sender: 'bot',
            type: 'info'
          })

          // Check available slots for each doctor on the selected date
          const doctorsWithSlots = await Promise.all(
            filteredDoctors.map(async (doctor) => {
              try {
                const slots = await appointmentsAPI.getAvailableSlots(
                  doctor.id.toString(),
                  bookingData.date!
                )
                return {
                  doctor,
                  hasSlots: slots.length > 0,
                  slotsCount: slots.length
                }
              } catch (error) {
                return {
                  doctor,
                  hasSlots: false,
                  slotsCount: 0
                }
              }
            })
          )

          // Filter to only doctors with available slots
          filteredDoctors = doctorsWithSlots
            .filter(item => item.hasSlots)
            .map(item => item.doctor)

          if (filteredDoctors.length === 0) {
            hideTypingIndicator()
            addMessage({
              text: `Không tìm thấy bác sĩ nào thuộc chuyên khoa ${specialty.name} có lịch trống vào ngày ${format(new Date(bookingData.date), 'dd/MM/yyyy')}. Vui lòng chọn chuyên khoa khác.`,
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
        }

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

        const dateInfo = bookingData.date 
          ? ` có lịch trống vào ngày ${format(new Date(bookingData.date), 'dd/MM/yyyy')}`
          : ''
        
        addMessage({
          text: `Tìm thấy ${filteredDoctors.length} bác sĩ${dateInfo}. Vui lòng chọn một bác sĩ:`,
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

    const doctorName = doctor.user?.first_name && doctor.user?.last_name
      ? `${doctor.user.first_name} ${doctor.user.last_name}`
      : 'Bác sĩ'

    addMessage({
      text: `Đã chọn: BS. ${doctorName}`,
      sender: 'user',
      type: 'text'
    })

    // If we already have date and time from datetime extraction, show final confirmation
    if (bookingData.date && bookingData.time) {
      setCurrentStep('confirm')
      showTypingIndicator()
      
      // Get specialty name
      specialitiesAPI.getAll()
        .then(specialities => {
          const specialtyName = bookingData.specialtyId 
            ? specialities.find(s => s.id === bookingData.specialtyId)?.name || 'Chuyên khoa'
            : 'Chuyên khoa'
          
          hideTypingIndicator()
          addMessage({
            text: 'Thông tin đặt lịch của bạn:',
            sender: 'bot',
            type: 'final_confirmation',
            confirmationData: {
              date: format(new Date(bookingData.date!), 'dd/MM/yyyy'),
              time: bookingData.time!.slice(0, 5),
              doctorName: `BS. ${doctorName}`,
              specialtyName: specialtyName
            }
          })
        })
        .catch(() => {
          hideTypingIndicator()
          addMessage({
            text: 'Thông tin đặt lịch của bạn:',
            sender: 'bot',
            type: 'final_confirmation',
            confirmationData: {
              date: format(new Date(bookingData.date!), 'dd/MM/yyyy'),
              time: bookingData.time!.slice(0, 5),
              doctorName: `BS. ${doctorName}`,
              specialtyName: 'Chuyên khoa'
            }
          })
        })
    } else {
      // No date/time yet, proceed to date selection
      setCurrentStep('select_date')
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
        text: (
          <div className="space-y-2">
            <p className="font-semibold">Xác nhận thông tin đặt lịch:</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                <span><strong>Ngày:</strong> {format(new Date(bookingData.date!), 'dd/MM/yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span><strong>Giờ:</strong> {timeDisplay}</span>
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                <span><strong>Bác sĩ:</strong> Đã chọn</span>
              </div>
            </div>
            <p className="text-sm mt-3">Thông tin này có chính xác không?</p>
          </div>
        ),
        sender: 'bot',
        type: 'info',
        actions: [
          {
            label: (
              <>
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Xác nhận
              </>
            ),
            action: handleConfirm,
            variant: 'default'
          },
          {
            label: (
              <>
                <X className="w-4 h-4 mr-1" />
                Hủy
              </>
            ),
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
          text: (
            <>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="font-semibold">Đặt lịch thành công!</span>
              </div>
              <p>Lịch hẹn của bạn đang chờ bác sĩ xác nhận. Bạn sẽ nhận được thông báo khi có cập nhật.</p>
            </>
          ),
          sender: 'bot',
          type: 'info'
        })

        toast({
          title: 'Đặt lịch thành công',
          description: 'Lịch hẹn của bạn đang chờ bác sĩ xác nhận.',
        })

        // Don't reset, keep messages for user to see
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

    // Check if user wants to book appointment
    const bookingKeywords = ['đặt lịch', 'dat lich', 'đặt hẹn', 'dat hen', 'book', 'booking', 'muốn đặt', 'muon dat', 'tôi muốn đặt', 'toi muon dat', 'đặt cho tôi', 'dat cho toi']
    const lowerText = text.toLowerCase()
    const wantsToBook = bookingKeywords.some(keyword => lowerText.includes(keyword))

    // If user wants to book (especially after completed step), reset and start new flow
    if (wantsToBook) {
      // If we're in completed step, reset first then continue
      if (currentStep === 'completed') {
        handleReset()
        // Store the text to use after reset
        const savedText = text
        setTimeout(() => {
          // Add user message after reset
          addMessage({
            text: savedText,
            sender: 'user',
            type: 'text'
          })
          // Continue with extraction
          setInputText('')
          showTypingIndicator()
          
          datetimeExtractionAPI.extract(savedText)
            .then(response => {
              hideTypingIndicator()
              
              if (response.error) {
                addMessage({
                  text: response.error,
                  sender: 'bot',
                  type: 'error',
                  actions: [
                    {
                      label: 'Nhập lại',
                      action: () => {},
                      variant: 'outline'
                    }
                  ]
                })
                return
              }
              
              if (response.extracted?.date && response.extracted?.time) {
                let parsedDate: Date | null = null
                try {
                  const [day, month, year] = response.extracted.date.split('/')
                  parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
                  
                  if (isNaN(parsedDate.getTime())) {
                    throw new Error('Invalid date')
                  }
                  
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  const selectedDateOnly = new Date(parsedDate)
                  selectedDateOnly.setHours(0, 0, 0, 0)
                  
                  if (selectedDateOnly < today) {
                    addMessage({
                      text: 'Không thể đặt lịch trong quá khứ. Vui lòng nhập lại với ngày từ hôm nay trở đi.',
                      sender: 'bot',
                      type: 'error'
                    })
                    return
                  }
                } catch (error) {
                  addMessage({
                    text: 'Không thể nhận diện ngày hợp lệ. Vui lòng nhập lại theo định dạng: đặt lịch vào ngày DD/MM/YYYY lúc HH:MM',
                    sender: 'bot',
                    type: 'error'
                  })
                  return
                }

                setCurrentStep('select_specialty')
                addMessage({
                  text: 'Đã nhận diện thông tin ngày và giờ từ tin nhắn của bạn:',
                  sender: 'bot',
                  type: 'datetime_confirmation',
                  extractedDateTime: {
                    date: response.extracted.date,
                    time: response.extracted.time,
                    parsedDate: parsedDate!
                  }
                })
              } else {
                addMessage({
                  text: 'Không thể nhận diện ngày và giờ từ tin nhắn. Vui lòng nhập lại theo định dạng: đặt lịch vào ngày DD/MM/YYYY lúc HH:MM',
                  sender: 'bot',
                  type: 'error'
                })
              }
            })
            .catch((error: any) => {
              hideTypingIndicator()
              let errorMessage = 'Không thể nhận diện ngày và giờ từ tin nhắn. Vui lòng nhập lại.'
              if (error?.response?.data?.error) {
                errorMessage = error.response.data.error
              } else if (error?.message) {
                errorMessage = error.message
              }
              addMessage({
                text: errorMessage,
                sender: 'bot',
                type: 'error',
                actions: [
                  {
                    label: 'Nhập lại',
                    action: () => {},
                    variant: 'outline'
                  }
                ]
              })
            })
        }, 300)
        return
      }
      showTypingIndicator()
      
      datetimeExtractionAPI.extract(text)
        .then(response => {
          hideTypingIndicator()
          
          // Check for error in response
          if (response.error) {
            addMessage({
              text: response.error,
              sender: 'bot',
              type: 'error',
              actions: [
                {
                  label: 'Nhập lại',
                  action: () => {
                    // Just clear input, user can type again
                  },
                  variant: 'outline'
                }
              ]
            })
            return
          }
          
          // Response should have extracted data
          if (!response.extracted) {
            addMessage({
              text: 'Không thể nhận diện ngày và giờ từ tin nhắn. Vui lòng nhập lại theo định dạng: đặt lịch vào ngày DD/MM/YYYY lúc HH:MM',
              sender: 'bot',
              type: 'error',
              actions: [
                {
                  label: 'Nhập lại',
                  action: () => {
                    // Just clear input, user can type again
                  },
                  variant: 'outline'
                }
              ]
            })
            return
          }
          
          if (response.extracted?.date && response.extracted?.time) {
            // Parse date from DD/MM/YYYY format
            let parsedDate: Date | null = null
            try {
              const [day, month, year] = response.extracted.date.split('/')
              parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
              
              if (isNaN(parsedDate.getTime())) {
                throw new Error('Invalid date')
              }
              
              // Check if date is in the past
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const selectedDateOnly = new Date(parsedDate)
              selectedDateOnly.setHours(0, 0, 0, 0)
              
              if (selectedDateOnly < today) {
                addMessage({
                  text: 'Không thể đặt lịch trong quá khứ. Vui lòng nhập lại với ngày từ hôm nay trở đi.',
                  sender: 'bot',
                  type: 'error'
                })
                return
              }
            } catch (error) {
              addMessage({
                text: 'Không thể nhận diện ngày hợp lệ. Vui lòng nhập lại theo định dạng: đặt lịch vào ngày DD/MM/YYYY lúc HH:MM',
                sender: 'bot',
                type: 'error'
              })
              return
            }

            // Show confirmation box
            setCurrentStep('select_specialty')
            addMessage({
              text: 'Đã nhận diện thông tin ngày và giờ từ tin nhắn của bạn:',
              sender: 'bot',
              type: 'datetime_confirmation',
              extractedDateTime: {
                date: response.extracted.date,
                time: response.extracted.time,
                parsedDate: parsedDate!
              }
            })
          } else {
            addMessage({
              text: 'Không thể nhận diện ngày và giờ từ tin nhắn. Vui lòng nhập lại theo định dạng: đặt lịch vào ngày DD/MM/YYYY lúc HH:MM',
              sender: 'bot',
              type: 'error'
            })
          }
        })
        .catch((error: any) => {
          hideTypingIndicator()
          
          // Extract error message from API response
          let errorMessage = 'Không thể nhận diện ngày và giờ từ tin nhắn. Vui lòng nhập lại.'
          
          if (error?.response?.data?.error) {
            errorMessage = error.response.data.error
          } else if (error?.message) {
            errorMessage = error.message
          }
          
          addMessage({
            text: errorMessage,
            sender: 'bot',
            type: 'error',
            actions: [
              {
                label: 'Nhập lại',
                action: () => {
                  // Just clear input, user can type again
                },
                variant: 'outline'
              }
            ]
          })
        })
      return
    }

    // Handle text input for date/time extraction if needed (legacy flow)
    if (currentStep === 'select_date' || currentStep === 'select_time') {
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

  // Chỉ hiển thị chatbot cho bệnh nhân đã đăng nhập (role.id === 3)
  // Không hiển thị cho bác sĩ (role.id === 2) hoặc người chưa đăng nhập
  const isPatient = isLoggedIn && user?.role?.id === 3
  
  if (!isPatient) {
    return null
  }

  // Closed state - show trigger button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="relative w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
        aria-label="Mở chatbot đặt lịch"
      >
        <MessageSquare className="h-6 w-6 text-white" />
        
        {/* Simple Badge Indicator */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-background flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-800 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg pointer-events-none">
          Đặt lịch khám
          <div className="absolute top-full right-4 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
        </div>
      </button>
    )
  }

  // Open state - show chat window
  return (
    <Card className={cn(
      "fixed bottom-4 right-4 w-[calc(100vw-2rem)] sm:w-[420px] md:w-[480px] lg:w-[520px] h-[600px] max-h-[85vh] min-h-[400px] z-[60] flex flex-col shadow-2xl border-2 overflow-hidden",
      isMinimized && "h-auto"
    )}>
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground p-4 flex items-center justify-between border-b border-primary/20 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            <Avatar className="h-10 w-10 border-2 border-primary-foreground/20">
              <AvatarFallback className="bg-primary-foreground/20">
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-primary-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm truncate">Trợ lý đặt lịch</h3>
            <p className="text-xs opacity-90 truncate">Đang hoạt động</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
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
          <ScrollArea className="flex-1 min-h-0 p-4 overflow-auto" ref={scrollAreaRef}>
            <div className="space-y-4 min-w-0">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 min-w-0',
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

                  <div className="flex flex-col gap-2 max-w-[85%] sm:max-w-[80%] min-w-0">
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-2.5 min-w-0 break-words',
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : message.type === 'error'
                          ? 'bg-destructive/10 text-destructive border border-destructive/20 rounded-tl-sm'
                          : 'bg-muted/50 text-foreground rounded-tl-sm'
                      )}
                    >
                      {typeof message.text === 'string' ? (
                        <p className="text-sm whitespace-pre-wrap leading-relaxed break-words" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                          {message.text}
                        </p>
                      ) : (
                        <div className="text-sm leading-relaxed break-words" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                          {message.text}
                        </div>
                      )}
                    </div>

                    {/* Example Texts */}
                    {message.exampleTexts && message.exampleTexts.length > 0 && (
                      <div className="space-y-2 min-w-0 max-w-full">
                        {message.exampleTexts.map((example, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setInputText(example)
                              setTimeout(() => {
                                handleSend()
                              }, 100)
                            }}
                            className="w-full justify-start text-left text-xs h-auto py-2 px-3 hover:bg-primary/5 hover:border-primary/50"
                          >
                            {example}
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* DateTime Confirmation Card */}
                    {message.type === 'datetime_confirmation' && message.extractedDateTime && (
                      <div className="min-w-0 max-w-full">
                        <DateTimeConfirmationCard
                          extractedDateTime={message.extractedDateTime}
                          onConfirm={() => handleConfirmDateTime(message.extractedDateTime!)}
                          onCancel={handleCancelDateTime}
                        />
                      </div>
                    )}

                    {/* Final Confirmation Card */}
                    {message.type === 'final_confirmation' && message.confirmationData && (
                      <div className="min-w-0 max-w-full">
                        <FinalConfirmationCard
                          confirmationData={message.confirmationData}
                          onConfirm={handleConfirm}
                          onCancel={() => {
                            setCurrentStep('select_doctor')
                            setBookingData(prev => ({ ...prev, doctorId: undefined }))
                            addMessage({
                              text: 'Đã hủy. Vui lòng chọn lại bác sĩ.',
                              sender: 'bot',
                              type: 'text'
                            })
                          }}
                        />
                      </div>
                    )}

                    {/* Action Chips */}
                    {message.actions && message.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2 min-w-0">
                        {message.actions.map((action, idx) => (
                          <Button
                            key={idx}
                            variant={action.variant || 'default'}
                            size="sm"
                            onClick={action.action}
                            className="text-xs h-auto py-2 px-3 break-words whitespace-normal"
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Specialities List */}
                    {message.specialities && message.specialities.length > 0 && (
                      <div className="space-y-2 min-w-0 max-w-full">
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
                      <div className="space-y-2 min-w-0">
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
                      <div className="grid grid-cols-3 gap-2 min-w-0">
                        {message.availableSlots.map((slot, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            onClick={() => handleTimeSelect(slot)}
                            className="text-xs min-w-0 break-words"
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
          {currentStep !== 'submitting' && (
            <div className="p-4 border-t bg-muted/30 flex-shrink-0">
              {!isLoggedIn && (
                <div className="mb-3 p-3 bg-muted rounded-lg text-sm text-center">
                  <p className="text-muted-foreground mb-2 break-words">
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
                <div className="flex gap-2 min-w-0">
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
                    className="flex-1 min-w-0"
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
