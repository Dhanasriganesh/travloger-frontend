import React, { useState, useEffect } from 'react'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { Plus, Search, Edit, Trash2, ArrowLeft, Receipt, DollarSign, Calendar, Filter, Download, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fetchApi, handleApiError } from '../../../lib/api'

interface ExpenseCategory {
  id: number
  name: string
  description: string
  status: string
  created_by: string
  date: string
}

interface ExpenseRecord {
  id: number
  expense_name: string
  category_id: number
  category_name: string
  amount: number
  currency: string
  expense_date: string
  description: string
  receipt_url: string
  vendor_name: string
  payment_method: string
  project_id: number | null
  employee_id: number | null
  is_reimbursable: boolean
  approval_status: string
  approved_by: string
  approved_at: string | null
  tags: string[]
  status: string
  created_by: string
  date: string
}

const ExpenseTracking: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'expenses' | 'categories'>('expenses')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null)
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null)

  // Filters
  const [filters, setFilters] = useState({
    category_id: '',
    approval_status: '',
    start_date: '',
    end_date: '',
    payment_method: ''
  })

  const [expenseFormData, setExpenseFormData] = useState({
    expense_name: '',
    category_id: '',
    amount: 0,
    currency: 'INR',
    expense_date: new Date().toISOString().split('T')[0],
    description: '',
    receipt_url: '',
    vendor_name: '',
    payment_method: 'Cash',
    project_id: '',
    employee_id: '',
    is_reimbursable: false,
    approval_status: 'Pending',
    tags: [] as string[]
  })

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    status: 'Active'
  })

  const paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'UPI', 'Cheque', 'Online Payment']
  const approvalStatuses = ['Pending', 'Approved', 'Rejected', 'Under Review']

  useEffect(() => {
    fetchExpenses()
    fetchCategories()
  }, [filters])

  const fetchExpenses = async () => {
    try {
      setLoading(true)

      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value)
      })

      const data = await fetchApi(`/api/expense-tracking?${queryParams}`)
      setExpenses(data.expenses || [])
    } catch (error) {
      console.error('Error fetching expenses:', error)
      handleApiError(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await fetchApi('/api/expense-tracking/categories')
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      handleApiError(error)
    }
  }

  const handleSaveExpense = async () => {
    if (!expenseFormData.expense_name.trim()) {
      alert('Please enter expense name')
      return
    }

    if (!expenseFormData.amount || expenseFormData.amount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    try {
      setSaving(true)
      const method = editingExpense ? 'PUT' : 'POST'
      const body = editingExpense
        ? { id: editingExpense.id, ...expenseFormData }
        : expenseFormData

      const data = await fetchApi('/api/expense-tracking', {
        method,
        body: JSON.stringify(body)
      })

      await fetchExpenses()
      setShowAddForm(false)
      resetExpenseForm()
      alert(data.message || 'Expense saved successfully')
    } catch (error) {
      console.error('Error saving expense:', error)
      handleApiError(error)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveCategory = async () => {
    if (!categoryFormData.name.trim()) {
      alert('Please enter category name')
      return
    }

    try {
      setSaving(true)

      const data = await fetchApi('/api/expense-tracking/categories', {
        method: 'POST',
        body: JSON.stringify(categoryFormData)
      })

      await fetchCategories()
      setShowAddForm(false)
      resetCategoryForm()
      alert(data.message || 'Category saved successfully')
    } catch (error) {
      console.error('Error saving category:', error)
      handleApiError(error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteExpense = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return
    }

    try {
      const data = await fetchApi(`/api/expense-tracking?id=${id}`, {
        method: 'DELETE'
      })

      await fetchExpenses()
      alert(data.message || 'Expense deleted successfully')
    } catch (error) {
      console.error('Error deleting expense:', error)
      handleApiError(error)
    }
  }

  const handleEditExpense = (expense: ExpenseRecord) => {
    setEditingExpense(expense)
    setExpenseFormData({
      expense_name: expense.expense_name,
      category_id: expense.category_id?.toString() || '',
      amount: expense.amount,
      currency: expense.currency,
      expense_date: expense.expense_date,
      description: expense.description || '',
      receipt_url: expense.receipt_url || '',
      vendor_name: expense.vendor_name || '',
      payment_method: expense.payment_method,
      project_id: expense.project_id?.toString() || '',
      employee_id: expense.employee_id?.toString() || '',
      is_reimbursable: expense.is_reimbursable,
      approval_status: expense.approval_status,
      tags: expense.tags || []
    })
    setActiveTab('expenses')
    setShowAddForm(true)
  }

  const resetExpenseForm = () => {
    setEditingExpense(null)
    setExpenseFormData({
      expense_name: '',
      category_id: '',
      amount: 0,
      currency: 'INR',
      expense_date: new Date().toISOString().split('T')[0],
      description: '',
      receipt_url: '',
      vendor_name: '',
      payment_method: 'Cash',
      project_id: '',
      employee_id: '',
      is_reimbursable: false,
      approval_status: 'Pending',
      tags: []
    })
  }

  const resetCategoryForm = () => {
    setEditingCategory(null)
    setCategoryFormData({
      name: '',
      description: '',
      status: 'Active'
    })
  }

  const handleCloseForm = () => {
    setShowAddForm(false)
    resetExpenseForm()
    resetCategoryForm()
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-600 text-white'
      case 'Rejected': return 'bg-red-600 text-white'
      case 'Under Review': return 'bg-yellow-600 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const filteredExpenses = expenses.filter(expense =>
    expense.expense_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading expense tracking...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/settings')}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-3 w-3" />
                <span className="text-xs">Back to Settings</span>
              </button>
              <h1 className="text-lg font-bold text-gray-900">Expense Tracking Master</h1>

              {/* Tabs */}
              <div className="flex border border-gray-300 rounded-md overflow-hidden ml-4">
                <button
                  onClick={() => setActiveTab('expenses')}
                  className={`px-3 py-1 text-xs font-medium ${activeTab === 'expenses'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Expenses
                </button>
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`px-3 py-1 text-xs font-medium ${activeTab === 'categories'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Categories
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                <Input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-48 h-8"
                />
              </div>
            </div>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 text-sm"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add {activeTab === 'expenses' ? 'Expense' : 'Category'}
            </Button>
          </div>
        </div>
      </div>

      {/* Filters for Expenses */}
      {activeTab === 'expenses' && (
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>

              <select
                value={filters.category_id}
                onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
                className="text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              <select
                value={filters.approval_status}
                onChange={(e) => setFilters({ ...filters, approval_status: e.target.value })}
                className="text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="">All Status</option>
                {approvalStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                className="text-xs border border-gray-300 rounded px-2 py-1"
                placeholder="Start Date"
              />

              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                className="text-xs border border-gray-300 rounded px-2 py-1"
                placeholder="End Date"
              />

              <button
                onClick={() => setFilters({ category_id: '', approval_status: '', start_date: '', end_date: '', payment_method: '' })}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-hidden">
              {activeTab === 'expenses' ? (
                <table className="w-full table-fixed">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-12 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icon</th>
                      <th className="w-48 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expense Name</th>
                      <th className="w-32 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="w-32 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                      <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                      <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="w-20 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">By</th>
                      <th className="w-12 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                      <th className="w-12 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-3 py-4 text-sm text-gray-900">
                          <Receipt className="h-5 w-5 text-green-500" />
                        </td>
                        <td className="px-3 py-4 text-sm font-medium text-gray-900 truncate" title={expense.expense_name}>
                          {expense.expense_name}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900 truncate">
                          {expense.category_name || '-'}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900">
                          {expense.currency} {expense.amount.toLocaleString()}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900">
                          {new Date(expense.expense_date).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900 truncate">
                          {expense.vendor_name || '-'}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900">
                          {expense.payment_method}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900">
                          <Badge className={getStatusBadgeColor(expense.approval_status)}>
                            {expense.approval_status}
                          </Badge>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900">
                          <div className="flex items-center gap-1">
                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">T</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          <button
                            onClick={() => handleEditExpense(expense)}
                            className="hover:text-gray-700"
                            title="Edit expense"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          <button
                            onClick={() => handleDeleteExpense(expense.id, expense.expense_name)}
                            className="hover:text-red-600"
                            title="Delete expense"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full table-fixed">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-12 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icon</th>
                      <th className="w-64 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Name</th>
                      <th className="w-96 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="w-20 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">By</th>
                      <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCategories.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50">
                        <td className="px-3 py-4 text-sm text-gray-900">
                          <DollarSign className="h-5 w-5 text-purple-500" />
                        </td>
                        <td className="px-3 py-4 text-sm font-medium text-gray-900 truncate">
                          {category.name}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900 truncate">
                          {category.description || '-'}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900">
                          <Badge
                            variant={category.status === 'Active' ? 'success' : 'secondary'}
                            className={category.status === 'Active' ? 'bg-green-600 text-white' : 'bg-gray-500 text-white'}
                          >
                            {category.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900">
                          <div className="flex items-center gap-1">
                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">T</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900">
                          {category.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 text-sm text-gray-600">
          Total Records: {activeTab === 'expenses' ? filteredExpenses.length : filteredCategories.length}
        </div>
      </div>

      {/* Add/Edit Form Panel */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            onClick={handleCloseForm}
          />

          <div className="absolute right-0 top-0 h-full w-[600px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {activeTab === 'expenses'
                    ? (editingExpense ? 'Edit Expense' : 'Add Expense')
                    : 'Add Category'
                  }
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                {activeTab === 'expenses' ? (
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expense Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          placeholder="Enter expense name"
                          value={expenseFormData.expense_name}
                          onChange={(e) => setExpenseFormData({ ...expenseFormData, expense_name: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={expenseFormData.category_id}
                          onChange={(e) => setExpenseFormData({ ...expenseFormData, category_id: e.target.value })}
                        >
                          <option value="">Select category</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Amount <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={expenseFormData.amount}
                          onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: parseFloat(e.target.value) || 0 })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={expenseFormData.currency}
                          onChange={(e) => setExpenseFormData({ ...expenseFormData, currency: e.target.value })}
                        >
                          <option value="INR">INR</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="date"
                          value={expenseFormData.expense_date}
                          onChange={(e) => setExpenseFormData({ ...expenseFormData, expense_date: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3}
                        placeholder="Enter expense description"
                        value={expenseFormData.description}
                        onChange={(e) => setExpenseFormData({ ...expenseFormData, description: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                        <Input
                          type="text"
                          placeholder="Enter vendor name"
                          value={expenseFormData.vendor_name}
                          onChange={(e) => setExpenseFormData({ ...expenseFormData, vendor_name: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={expenseFormData.payment_method}
                          onChange={(e) => setExpenseFormData({ ...expenseFormData, payment_method: e.target.value })}
                        >
                          {paymentMethods.map(method => (
                            <option key={method} value={method}>{method}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Receipt URL</label>
                      <Input
                        type="url"
                        placeholder="https://..."
                        value={expenseFormData.receipt_url}
                        onChange={(e) => setExpenseFormData({ ...expenseFormData, receipt_url: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Approval Status</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={expenseFormData.approval_status}
                          onChange={(e) => setExpenseFormData({ ...expenseFormData, approval_status: e.target.value })}
                        >
                          {approvalStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center mt-6">
                        <input
                          type="checkbox"
                          id="is_reimbursable"
                          checked={expenseFormData.is_reimbursable}
                          onChange={(e) => setExpenseFormData({ ...expenseFormData, is_reimbursable: e.target.checked })}
                          className="mr-2"
                        />
                        <label htmlFor="is_reimbursable" className="text-sm text-gray-700">
                          Reimbursable
                        </label>
                      </div>
                    </div>
                  </form>
                ) : (
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter category name"
                        value={categoryFormData.name}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3}
                        placeholder="Enter category description"
                        value={categoryFormData.description}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={categoryFormData.status}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, status: e.target.value })}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </form>
                )}
              </div>

              <div className="p-6 border-t border-gray-200">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCloseForm}
                    className="flex-1"
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={activeTab === 'expenses' ? handleSaveExpense : handleSaveCategory}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : (editingExpense ? 'Update' : 'Save')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExpenseTracking



