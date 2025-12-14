"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/calc-draft-ui/button"
import { Download, RefreshCw, ArrowLeft, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import DraftStepper from "@/components/calc-draft-components/draft-stepper"
import DraftPreviewTable from "@/components/calc-draft-components/draft-preview-table"
import ExceptionPanel from "@/components/calc-draft-components/exception-panel"
import SummaryCards from "@/components/calc-draft-components/summary-cards"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

export default function DraftReviewPage() {
  const params = useParams()
  const router = useRouter()
  const draftId = params.id as string
  const { toast } = useToast()

  const [draft, setDraft] = useState<any>({
    _id: draftId,
    runId: "Loading...",
    employees: 0,
    totalnetpay: 0,
    status: "pending",
    payrollPeriod: null,
  })
  const [employees, setEmployees] = useState<any[]>([])
  const [exceptions, setExceptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recalculating, setRecalculating] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchDraftData()
  }, [draftId])

  const fetchDraftData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch draft/run data
      const response = await fetch(`${API_URL}/payroll-execution/payroll-runs/${draftId}`)
      if (!response.ok) throw new Error("Failed to fetch draft data")
      const draftData = await response.json()

      // Fetch employee details - try multiple endpoints
      let employeesData: any[] = []
      
      // Try primary endpoint
      const detailsResponse = await fetch(`${API_URL}/payroll-execution/payroll-runs/${draftId}/review/draft`)
      if (detailsResponse.ok) {
        const result = await detailsResponse.json()
        employeesData = result.employees || result || []
      } else {
        // Fallback to alternative endpoint
        const fallbackResponse = await fetch(`${API_URL}/payroll/draft/${draftId}/details`)
        if (fallbackResponse.ok) {
          employeesData = await fallbackResponse.json()
        }
      }

      if (!Array.isArray(employeesData)) {
        employeesData = []
      }

      const exceptionsData = parseExceptions(employeesData, draftData)

      setDraft(draftData)
      setEmployees(employeesData)
      setExceptions(exceptionsData)
      setLoading(false)
    } catch (err: any) {
      console.error('Error fetching draft data:', err)
      setError(err.message || 'Failed to load draft data')
      setLoading(false)
      toast({
        title: "Error",
        description: err.message || "Failed to load draft data",
        variant: "destructive",
      })
    }
  }

  const parseExceptions = (employees: any[], draftData: any) => {
    const exceptionsList: any[] = []

    if (!Array.isArray(employees)) return exceptionsList

    employees.forEach((employee) => {
      if (employee.exceptions && typeof employee.exceptions === "string") {
        const exceptionStrings = employee.exceptions
          .split("|")
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0)

        exceptionStrings.forEach((excString: string, index: number) => {
          const colonIndex = excString.indexOf(":")
          let type = "UNKNOWN"
          let description = excString

          if (colonIndex > -1) {
            type = excString.substring(0, colonIndex).trim()
            description = excString.substring(colonIndex + 1).trim()
          }

          let severity = "MEDIUM"
          if (type === "NEGATIVE_NET_PAY" || type === "EXCESSIVE_PENALTIES") {
            severity = "HIGH"
          } else if (type === "ZERO_BASE_SALARY") {
            severity = "HIGH"
          } else if (type === "CALCULATION_ERROR") {
            severity = "CRITICAL"
          } else if (type === "MISSING_BANK_DETAILS") {
            severity = "HIGH"
          }

          exceptionsList.push({
            _id: `exc_${employee._id}_${index}`,
            employeeId: employee._id,
            employeeName: employee.name || employee.employeeName || "Unknown",
            employeeCode: employee.code || employee.employeeCode || "N/A",
            payrollRunId: draftData?._id || draftId,
            runId: draftData?.runId || "N/A",
            type,
            severity,
            description,
            status: "open",
            createdAt: new Date().toISOString(),
          })
        })
      }
    })

    return exceptionsList
  }

  const handleRecalculate = async (stage?: string) => {
    try {
      setRecalculating(true)

      // Try primary endpoint
      let response = await fetch(`${API_URL}/payroll-execution/payroll-runs/${draftId}/recalculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      })

      // Fallback to alternative endpoint
      if (!response.ok) {
        response = await fetch(`${API_URL}/payroll/draft/${draftId}/recalculate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage }),
        })
      }

      if (!response.ok) throw new Error("Failed to recalculate")

      toast({
        title: "Success",
        description: stage ? `${stage} recalculated successfully` : "Draft recalculated successfully",
      })

      // Refresh data
      await fetchDraftData()
    } catch (err: any) {
      console.error('Recalculation error:', err)
      toast({
        title: "Error",
        description: err.message || "Failed to recalculate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setRecalculating(false)
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true)

      // Try to export as Excel
      const response = await fetch(`${API_URL}/payroll-execution/payroll-runs/${draftId}/export`, {
        method: 'GET',
      })

      if (!response.ok) {
        // Fallback: Generate CSV client-side
        generateCSVExport()
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Payroll_Draft_${draft.runId}_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Success",
        description: "Draft exported successfully",
      })
    } catch (err: any) {
      console.error('Export error:', err)
      // Fallback to CSV
      generateCSVExport()
    } finally {
      setExporting(false)
    }
  }

  const generateCSVExport = () => {
    try {
      let csv = 'Employee ID,Employee Name,Department,Base Salary,Allowances,Deductions,Net Pay,Exceptions\n'
      
      employees.forEach(emp => {
        csv += `"${emp.employeeCode || emp.code || ''}",`
        csv += `"${emp.employeeName || emp.name || ''}",`
        csv += `"${emp.department || ''}",`
        csv += `"${emp.baseSalary || 0}",`
        csv += `"${emp.allowances || 0}",`
        csv += `"${emp.deductions || 0}",`
        csv += `"${emp.netPay || 0}",`
        csv += `"${(emp.exceptions || '').replace(/"/g, '""')}"\n`
      })

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Payroll_Draft_${draft.runId}_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Success",
        description: "Draft exported as CSV",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to export draft",
        variant: "destructive",
      })
    }
  }

  const handleBack = () => {
    router.push('/payroll/runs')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading draft data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto mb-4 text-destructive" size={48} />
          <h2 className="text-2xl font-bold mb-2">Failed to Load Draft</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={fetchDraftData} variant="default">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Runs
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Draft Review</h1>
          <p className="text-base text-muted-foreground">
            {draft?.runId || "N/A"} • {" "}
            {draft?.payrollPeriod 
              ? new Date(draft.payrollPeriod).toLocaleDateString()
              : draft?.payrollPeriodStart && draft?.payrollPeriodEnd
              ? `${new Date(draft.payrollPeriodStart).toLocaleDateString()} to ${new Date(draft.payrollPeriodEnd).toLocaleDateString()}`
              : "Period not set"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="default" 
            className="gap-2 bg-transparent"
            onClick={handleExport}
            disabled={exporting || employees.length === 0}
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export'}
          </Button>
          <Button 
            size="default" 
            onClick={() => handleRecalculate()} 
            disabled={recalculating} 
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${recalculating ? "animate-spin" : ""}`} />
            {recalculating ? 'Recalculating...' : 'Recalculate All'}
          </Button>
          <Button 
            size="default" 
            className="gap-2"
            onClick={handleBack}
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </div>

      <SummaryCards draft={draft} />

      {employees.length === 0 && !loading ? (
        <div className="bg-card rounded-lg border p-12 text-center">
          <AlertCircle className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h3 className="text-xl font-semibold mb-2">No Employee Data</h3>
          <p className="text-muted-foreground mb-6">
            This payroll run doesn't have any employee records yet.
          </p>
          <Button onClick={fetchDraftData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
          <div className="lg:col-span-1">
            <DraftStepper 
              draft={draft} 
              onRecalculate={handleRecalculate} 
              recalculating={recalculating} 
            />
          </div>

          <div className="lg:col-span-2">
            <DraftPreviewTable 
              employees={employees} 
              draftId={draftId} 
              exceptions={exceptions} 
            />
          </div>

          <div className="lg:col-span-1">
            <ExceptionPanel 
              exceptions={exceptions} 
              draftId={draftId} 
            />
          </div>
        </div>
      )}
    </div>
  )
}