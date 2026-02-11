// components/PaymentModal.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface Package {
  id: number
  name: string
  duration: string
  price: string
}

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  selectedPackage: Package | null
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, selectedPackage }) => {
  const [copiedType, setCopiedType] = useState<'card' | 'name' | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const cardNumber = '6219861934943506'
  const cardHolder = 'محمد علی بایمانی'
  const whatsappNumber = '989398351743'

  const handleCopy = async (text: string, type: 'card' | 'name') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedType(type)
      setTimeout(() => setCopiedType(null), 2000)
    } catch (err) {
      console.error('خطا در کپی کردن:', err)
    }
  }

  const whatsappMessage = encodeURIComponent(
    `سلام 👋\n` +
    `من خرید پکیج ${selectedPackage?.name} رو انجام دادم.\n` +
    `مبلغ: ${selectedPackage?.price}\n` +
    `مدت: ${selectedPackage?.duration}\n` +
    `مبلغ رو به کارت شما واریز کردم.\n` +
    `فیش واریزی رو در این چت ارسال می‌کنم.\n\n` +
    `لطفاً پس از بررسی، دسترسی‌ام رو فعال کنید.\n` +
    `با تشکر`
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container - Compact */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        dir="rtl"
      >
        {/* Compact Header - Only close button */}
        <div className="flex justify-between px-3 py-1 bg-gradient-to-r from-blue-600/10 to-indigo-700/10 dark:from-blue-600/20 dark:to-indigo-700/20">
                   {/* Compact Order Summary */}
                   <div className="flex items-center justify-between p-3 rounded-xl border border-blue-100 dark:border-blue-800/20">
                <div className="flex-1">
                  <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2 ">
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">{selectedPackage?.name}</span>
                  </div>
                    <div className="w-px h-3 bg-gray-300 dark:bg-gray-700"></div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500 dark:text-gray-400">مبلغ:</span>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{selectedPackage?.price}</span>
                    </div>
                  </div>
                </div>
     
              </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
            aria-label="بستن"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content - Compact */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {!showConfirm ? (
            <>
     

              {/* Bank Card - Compact */}
              <div className="space-y-3">

                {/* Compact Card Design */}
                <div className="relative bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-4 text-white shadow-lg overflow-hidden">
                  {/* Decorative elements - smaller */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
                  
                  {/* Card content - compact */}
                  <div className="relative z-10">
                    {/* Bank info - compact */}
                    {/* <div className="flex items-center justify-between mb-4">
                      <div className="text-xs opacity-80">بلوبانک سامان</div>
                      <div className="w-8 h-6 bg-gradient-to-r from-amber-400 to-amber-300 rounded-md shadow-inner">
                        <div className="w-5 h-3 bg-amber-200/30 rounded-sm mx-auto mt-1.5"></div>
                      </div>
                    </div> */}

                    {/* Card number - compact */}
                    <div className="mb-4">
                      <div className="text-xs opacity-60 mb-1">شماره کارت</div>
                      <div className="flex items-center justify-between">
                        <div dir='ltr' className="font-mono text-lg tracking-wider">
                          {cardNumber.match(/.{1,4}/g)?.join('  ')}
                        </div>
                        <button
                          onClick={() => handleCopy(cardNumber, 'card')}
                          className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded transition-colors text-xs"
                        >
                          {copiedType === 'card' ? (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          )}
                          <span>{copiedType === 'card' ? 'کپی شد' : 'کپی'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Card holder - compact */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/20">
                     
                        <div className="opacity-60 font-medium text-xs"> {cardHolder}</div>
                        <div className="opacity-60 font-medium text-xs">بلو بانک سامان </div>
                    


                  </div>
                  </div>
                </div>
              </div>

              {/* Compact Notes & Steps combined */}
              <div className="space-y-3">
                {/* Quick Notes */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-lg p-3 border border-amber-100 dark:border-amber-800/20">
                  <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    نکات مهم
                  </h4>
                  <ul className="space-y-1 text-xs text-amber-700 dark:text-amber-300">
                    <li className="flex items-start gap-1">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>دقیقاً مبلغ <span className="font-bold">{selectedPackage?.price}</span> به شماره کارت بالا واریز شود.</span>
                    </li>
            
                    <li className="flex items-start gap-1">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>از رسید پرداخت اسکرین‌شات بگیرید</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>روی دکمه ارسال رسید در واتساپ بزنید تا فرآیند تکمیل شود</span>
                    </li>
                  </ul>
                </div>

                {/* Quick Steps */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { step: '۱', text: 'واریز مبلغ', color: 'bg-emerald-500' },
                    { step: '۲', text: 'اسکرین‌شات', color: 'bg-blue-500' },
                    { step: '۳', text: 'ارسال در واتساپ', color: 'bg-green-500' }
                  ].map((item) => (
                    <div key={item.step} className="text-center">
                      <div className={`${item.color} text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-1`}>
                        {item.step}
                      </div>
                      <span className="text-xs text-gray-700 dark:text-gray-300">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Compact Confirmation View */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-2"
            >
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">آماده ارسال در واتساپ</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                  متن پیام آماده است. تصویر فیش را در واتساپ ارسال کنید.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4 border border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">متن آماده شده:</div>
                <div className="bg-white dark:bg-gray-900 p-3 rounded text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed border border-dashed border-gray-300 dark:border-gray-600 max-h-32 overflow-y-auto">
                  {decodeURIComponent(whatsappMessage)}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer Actions - Simplified */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="space-y-2">
            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411" />
                </svg>
                 ارسال رسید در واتساپ
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, '_blank')
                    onClose()
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg active:scale-[0.98]"
                >
                  تایید و انتقال به واتساپ
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="w-full py-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                >
                  بازگشت به اطلاعات کارت
                </button>
              </>
            )}
            

          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default PaymentModal