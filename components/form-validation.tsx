"use client"

interface ValidationError {
  field: string
  message: string
}

interface FormValidationProps {
  errors: ValidationError[]
}

export function FormValidation({ errors }: FormValidationProps) {
  if (errors.length === 0) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
      <div className="flex">
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
          <div className="mt-2 text-sm text-red-700">
            <ul className="list-disc pl-5 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
