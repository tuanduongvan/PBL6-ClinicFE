'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2, ArrowLeft, CheckCircle2, Upload, FileText, X, Stethoscope, Users, Award, DollarSign } from 'lucide-react'
import { authAPI } from '@/services/api/auth'
import { specialitiesAPI, Speciality } from '@/services/api/specialities'
import { fileUploadAPI } from '@/services/api/file-upload'
import { useAuthContext } from '@/components/auth-provider'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'
import { DoctorRegisterPayload } from '@/types/auth'

// Zod schema for doctor registration
const doctorRegistrationSchema = z.object({
  // Personal information
  firstName: z.string().min(1, 'Tên là bắt buộc'),
  lastName: z.string().min(1, 'Họ là bắt buộc'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(1, 'Số điện thoại là bắt buộc'),
  password: z.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/[a-zA-Z]/, 'Mật khẩu phải chứa chữ cái')
    .regex(/\d/, 'Mật khẩu phải chứa số'),
  password_confirm: z.string(),
  
  // Professional information
  specialty: z.number().min(1, 'Vui lòng chọn chuyên khoa'),
  experience: z.number().min(0, 'Số năm kinh nghiệm không hợp lệ').optional().nullable(),
  currentWorkplace: z.string().optional().nullable(),
  price: z.number().min(1, 'Giá khám phải lớn hơn 0'),
  medicalLicenseUrl: z.string().url('URL không hợp lệ').optional().nullable().or(z.literal('')),
  bio: z.string().optional().nullable(),
}).refine((data) => data.password === data.password_confirm, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['password_confirm'],
})

type DoctorRegistrationFormValues = z.infer<typeof doctorRegistrationSchema>

export default function DoctorRegisterPage() {
  const router = useRouter()
  const { login } = useAuthContext()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [specialities, setSpecialities] = useState<Speciality[]>([])
  const [credentialFile, setCredentialFile] = useState<File | null>(null)
  const [isUploadingFile, setIsUploadingFile] = useState(false)

  const form = useForm<DoctorRegistrationFormValues>({
    resolver: zodResolver(doctorRegistrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      password_confirm: '',
      specialty: 0,
      experience: null,
      currentWorkplace: '',
      price: 0,
      medicalLicenseUrl: '',
      bio: '',
    },
  })

  // Load specialities
  useEffect(() => {
    const loadData = async () => {
      try {
        const specialitiesData = await specialitiesAPI.getAll()
        setSpecialities(specialitiesData)
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Không thể tải dữ liệu. Vui lòng thử lại sau.',
        })
      } finally {
        setIsLoadingData(false)
      }
    }
    loadData()
  }, [toast])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!fileUploadAPI.isDocumentFile(file)) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Chỉ chấp nhận file tài liệu (PDF, DOC, DOCX, JPG, PNG, etc.)',
      })
      e.target.value = ''
      return
    }

    const fileSizeMB = fileUploadAPI.getFileSizeMB(file)
    if (fileSizeMB > 10) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Kích thước file không được vượt quá 10MB',
      })
      e.target.value = ''
      return
    }

    setCredentialFile(file)
    form.setValue('medicalLicenseUrl', '') // Clear URL if file is selected
  }

  const handleRemoveFile = () => {
    setCredentialFile(null)
  }

  /**
   * Helper function to map form data to API payload
   * Ensures proper field name mapping and data type conversion
   */
  const mapDoctorFormToApiPayload = (
    formData: DoctorRegistrationFormValues,
    username: string,
    medicalLicenseUrl: string | null
  ): DoctorRegisterPayload => {
    return {
      // User account fields (snake_case for backend)
      username,
      password: formData.password,
      password_confirm: formData.password_confirm,
      phone: formData.phone.trim(),
      email: formData.email.trim().toLowerCase(),
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      gender: 1 as const, // Default gender (UserGenderID)
      // Note: role is NOT needed - backend automatically sets it to Doctor
      
      // Doctor-specific fields
      // Ensure numbers are properly parsed
      specialty: Number(formData.specialty),
      price: Number(formData.price),
      experience: formData.experience !== null && formData.experience !== undefined 
        ? Number(formData.experience) 
        : null,
      
      // Backend accepts both medicalLicenseUrl and credentiaUrl as aliases
      medicalLicenseUrl: medicalLicenseUrl || formData.medicalLicenseUrl?.trim() || null,
      
      // Backend accepts both bio and description as aliases
      bio: formData.bio?.trim() || null,
      
      // Optional fields
      currentWorkplace: formData.currentWorkplace?.trim() || null,
    }
  }

  const onSubmit = async (data: DoctorRegistrationFormValues) => {
    setIsLoading(true)

    try {
      // Step 1: Upload credential file if provided
      let medicalLicenseUrl: string | null = null
      
      if (credentialFile) {
        setIsUploadingFile(true)
        try {
          medicalLicenseUrl = await fileUploadAPI.upload(credentialFile)
          console.log('File uploaded successfully:', medicalLicenseUrl)
        } catch (uploadError: any) {
          setIsUploadingFile(false)
          console.error('File upload error:', uploadError)
          toast({
            variant: 'destructive',
            title: 'Lỗi tải lên file',
            description: uploadError.message || 'Không thể tải lên file. Vui lòng thử lại.',
          })
          return // Stop execution if file upload fails
        } finally {
          setIsUploadingFile(false)
        }
      } else if (data.medicalLicenseUrl) {
        // Use URL if provided
        medicalLicenseUrl = data.medicalLicenseUrl.trim()
      }

      // Step 2: Generate username from email
      const username = data.email.split('@')[0] + '_' + Date.now().toString().slice(-6)

      // Step 3: Map form data to API payload
      const registerData = mapDoctorFormToApiPayload(data, username, medicalLicenseUrl)

      // Debug: Log the final payload before sending
      console.log('Final Payload:', JSON.stringify(registerData, null, 2))
      
      // Step 4: Call API
      let result
      try {
        result = await authAPI.registerDoctor(registerData)
        // Debug: Log the response
        console.log('Registration Response:', result)
      } catch (apiError: any) {
        // Handle API errors that are thrown (not returned)
        console.error('Registration API Error (thrown):', apiError)
        console.error('Error details:', {
          message: apiError.message,
          errors: apiError.errors,
          response: apiError.response
        })
        
        // Convert thrown error to result format
        result = {
          success: false,
          message: apiError.message || 'Đăng ký thất bại. Vui lòng thử lại.',
          errors: apiError.errors || {}
        }
      }
      
      // Step 5: Check if registration was successful
      // Successful response must have: user, tokens with access token
      // AND must NOT have errors or success: false
      const isSuccess = result && 
                       typeof result === 'object' &&
                       'user' in result && 
                       'tokens' in result && 
                       result.tokens?.access &&
                       !('errors' in result) &&
                       !('success' in result && result.success === false)
      
      if (isSuccess && 'user' in result && 'tokens' in result) {
        // SUCCESS: Registration completed successfully
        console.log('Registration successful!', result.user)
        
        // Save user session (without auto-redirect)
        if (result.user && result.tokens?.access) {
          login(result.user, result.tokens.access, false) // Don't auto-redirect from login
        }
        
        toast({
          title: 'Đăng ký thành công!',
          description: 'Tài khoản của bạn đang chờ xác minh. Bạn sẽ nhận được thông báo khi tài khoản được duyệt.',
        })
        
        // ONLY redirect on success - use setTimeout to ensure toast is shown
        setTimeout(() => {
          router.push('/doctor/dashboard')
        }, 1000)
      } else {
        // ERROR: Registration failed - show error and DO NOT redirect
        console.error('Registration failed - invalid response:', result)
        
        const errorMessage = (result && typeof result === 'object' && 'message' in result)
          ? result.message 
          : 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.'
        
        // Format error details for better readability
        let errorDetails = ''
        if (result && typeof result === 'object' && 'errors' in result && result.errors) {
          const errorArray = Object.entries(result.errors).map(([field, messages]) => {
            const msgArray = Array.isArray(messages) ? messages : [messages]
            return `${field}: ${msgArray.join(', ')}`
          })
          errorDetails = errorArray.join(' | ')
        }
        
        toast({
          variant: 'destructive',
          title: 'Đăng ký thất bại',
          description: errorDetails ? `${errorMessage}\n\n${errorDetails}` : errorMessage,
        })
        
        // DO NOT redirect on error - stay on the form
        // DO NOT call login() - this prevents auto-redirect
      }
    } catch (err: any) {
      // ERROR: Exception occurred during registration
      console.error('Registration Exception:', err)
      console.error('API Error Response:', err.response)
      
      // Extract error message from response
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Đăng ký thất bại. Vui lòng thử lại sau.'
      
      // Format error details for better readability
      let errorDetails = ''
      if (err.response?.data?.errors) {
        const errorArray = Object.entries(err.response.data.errors).map(([field, messages]) => {
          const msgArray = Array.isArray(messages) ? messages : [messages]
          return `${field}: ${msgArray.join(', ')}`
        })
        errorDetails = errorArray.join(' | ')
      }
      
      toast({
        variant: 'destructive',
        title: 'Lỗi hệ thống',
        description: errorDetails ? `${errorMessage}\n\n${errorDetails}` : errorMessage,
      })
      
      // DO NOT redirect on error - stay on the form
    } finally {
      setIsLoading(false)
      setIsUploadingFile(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Side - Benefits/Information */}
        <div className="hidden lg:flex flex-col justify-center p-12 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5">
          <div className="max-w-md mx-auto space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Join Our Medical Team
              </h1>
              <p className="text-lg text-muted-foreground">
                Become part of Derma Clinic's professional network of dermatologists
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Reach More Patients</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect with thousands of patients looking for expert dermatological care
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Professional Growth</h3>
                  <p className="text-sm text-muted-foreground">
                    Build your reputation and grow your practice with our platform
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Set Your Rates</h3>
                  <p className="text-sm text-muted-foreground">
                    Control your consultation fees and manage your schedule independently
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                All applications are reviewed by our team. You'll receive a notification once your account is verified.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="flex flex-col justify-center p-8 lg:p-12">
          <div className="max-w-2xl mx-auto w-full">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Về trang chủ</span>
            </Link>

            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                Doctor Registration
              </h1>
              <p className="text-muted-foreground">
                Fill out the form below to apply as a doctor at Derma Clinic
              </p>
            </div>

            <Card className="shadow-xl border-2">
              <CardHeader>
                <CardTitle>Application Form</CardTitle>
                <CardDescription>
                  Please provide accurate information. Your application will be reviewed by our team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                        Personal Information
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                First Name <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} disabled={isLoading} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Last Name <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} disabled={isLoading} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Email <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="doctor@example.com" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Phone <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="+84 123 456 789" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Password <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Min 8 chars, letters & numbers" {...field} disabled={isLoading} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="password_confirm"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Confirm Password <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Confirm password" {...field} disabled={isLoading} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Professional Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                        Professional Information
                      </h3>

                      <FormField
                        control={form.control}
                        name="specialty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Specialty <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange(parseInt(value))}
                              value={field.value?.toString()}
                              disabled={isLoading}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select specialty" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {specialities.map((specialty) => (
                                  <SelectItem key={specialty.id} value={specialty.id.toString()}>
                                    {specialty.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="experience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Years of Experience</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="5" 
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                  value={field.value || ''}
                                  disabled={isLoading}
                                  min="0"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Consultation Fee (VNĐ) <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="500000" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  value={field.value || ''}
                                  disabled={isLoading}
                                  min="0"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="currentWorkplace"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Workplace</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Hospital/Clinic name" 
                                {...field}
                                value={field.value || ''}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormDescription>
                              Optional: Your current place of work
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="medicalLicenseUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Medical License / Certificate</FormLabel>
                            {!credentialFile ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-4">
                                  <label
                                    htmlFor="credentialFile"
                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                  >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                      <p className="mb-2 text-sm text-muted-foreground">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                                      </p>
                                    </div>
                                    <input
                                      id="credentialFile"
                                      type="file"
                                      className="hidden"
                                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                                      onChange={handleFileChange}
                                      disabled={isLoading || isUploadingFile}
                                    />
                                  </label>
                                </div>
                                <FormDescription>
                                  Or enter URL directly:
                                </FormDescription>
                                <FormControl>
                                  <Input
                                    type="url"
                                    placeholder="https://example.com/license.pdf"
                                    {...field}
                                    value={field.value || ''}
                                    disabled={isLoading || isUploadingFile || !!credentialFile}
                                  />
                                </FormControl>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
                                <FileText className="w-8 h-8 text-primary flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{credentialFile.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {(credentialFile.size / (1024 * 1024)).toFixed(2)} MB
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={handleRemoveFile}
                                  disabled={isLoading || isUploadingFile}
                                  className="flex-shrink-0"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio / Professional Summary</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us about your professional background, expertise, and achievements..."
                                {...field}
                                value={field.value || ''}
                                disabled={isLoading}
                                rows={4}
                                className="resize-none"
                              />
                            </FormControl>
                            <FormDescription>
                              Optional: A brief introduction about yourself
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <Button 
                        type="submit" 
                        className="flex-1 bg-primary hover:bg-primary/90"
                        disabled={isLoading || isUploadingFile}
                        size="lg"
                      >
                        {isLoading || isUploadingFile ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isUploadingFile ? 'Uploading file...' : 'Submitting...'}
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Submit Application
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/')}
                        disabled={isLoading}
                        size="lg"
                      >
                        Cancel
                      </Button>
                    </div>

                    <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                      <span>Already have an account? </span>
                      <Link href="/?signin=true" className="text-primary font-semibold hover:underline">
                        Sign In
                      </Link>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
