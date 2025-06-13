import * as React from 'react'
import { type UniqueIdentifier } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronUpIcon,
  ColumnsIcon,
  ImageIcon,
  MoreVerticalIcon,
  XCircleIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Doc } from '@/../convex/_generated/dataModel'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { ArrowUpDownIcon } from 'lucide-react'
import { AddProductDialog } from '@/components/features/products/add-product-dialog'
import { EditProductSheet } from '@/components/features/products/edit-product-sheet'
import type { ProductFormData } from '@/lib/product-form-schema'
import { validateField, getValidationError } from '@/lib/product-form-schema'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

type ProductWithImageUrl = Doc<'products'> & { imageUrl: string | null }

interface MenuDataTableProps {
  data?: ProductWithImageUrl[]
  categories?: string[]
  statuses?: { value: boolean; label: string }[]
  isPending?: boolean
  mutations: {
    updateProduct: any
    updateAvailability: any
    deleteProduct: any
    addProduct: any
    bulkDeleteProducts: any
  }
}

export function MenuDataTable({
  data: productsData,
  categories,
  statuses,
  isPending,
  mutations,
}: MenuDataTableProps) {
  const [data, setData] = React.useState<ProductWithImageUrl[]>([])
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      category: false,
      status: false,
    })
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [editingProductId, setEditingProductId] = React.useState<string | null>(
    null,
  )
  const [columnSizing, setColumnSizing] = React.useState<
    Record<string, number>
  >({})

  React.useEffect(() => {
    if (productsData) {
      setData(productsData)
    }
  }, [productsData])

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setColumnVisibility({
          category: false,
          status: false,
        })
      } else {
        setColumnVisibility({
          category: true,
          status: true,
        })
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleAddProduct = (productData: ProductFormData) => {
    mutations.addProduct.mutateAsync(productData)
  }

  const handleUpdateProduct = (
    updateData: ProductFormData & { productId: string },
  ) => {
    const { productId, ...productData } = updateData
    mutations.updateProduct.mutateAsync({
      productId,
      ...productData,
    })
    setEditingProductId(null)
  }

  const columns: ColumnDef<ProductWithImageUrl>[] = React.useMemo(
    () => [
      {
        id: 'image',
        header: () => null,
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            {row.original.imageUrl ? (
              <img
                src={row.original.imageUrl}
                alt={row.original.name}
                className="size-10 rounded object-cover border"
              />
            ) : (
              <div className="size-10 rounded border border-dashed border-muted-foreground/30 flex items-center justify-center">
                <ImageIcon className="size-3 text-muted-foreground/50" />
              </div>
            )}
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        size: 100,
        minSize: 100,
        maxSize: 100,
      },
      {
        id: 'select',
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && 'indeterminate')
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        size: 48,
        minSize: 48,
        maxSize: 48,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              className="h-auto p-0 font-medium hover:bg-transparent  justify-start w-fit"
            >
              Product Name
              {column.getIsSorted() === 'asc' ? (
                <ChevronUpIcon className="size-4" />
              ) : column.getIsSorted() === 'desc' ? (
                <ChevronDownIcon className="size-4" />
              ) : (
                <ArrowUpDownIcon className="size-4" />
              )}
            </Button>
          )
        },
        cell: ({ row }) => {
          return (
            <div className="min-w-0 overflow-hidden">
              <EditProductSheet
                product={row.original}
                categories={categories}
                isOpen={editingProductId === row.original._id}
                onOpenChange={(open) =>
                  setEditingProductId(open ? row.original._id : null)
                }
                onUpdateProduct={handleUpdateProduct}
                isSubmitting={mutations.updateProduct.isPending}
              />
            </div>
          )
        },
        enableHiding: false,
        size: 100,
        minSize: 80,
        maxSize: 200,
      },
      {
        accessorKey: 'description',
        header: () => 'Description',
        cell: ({ row }) => {
          const [isEditing, setIsEditing] = React.useState(false)
          const description = row.original.description || ''

          if (isEditing) {
            return (
              <div className="min-w-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    const description = formData.get('description') as string
                    const trimmedDescription = description?.trim() || null
                    const originalDescription = row.original.description || null

                    const normalizeDescription = (desc: string | null) =>
                      desc?.trim() === '' ? null : desc?.trim() || null

                    if (
                      normalizeDescription(trimmedDescription) ===
                      normalizeDescription(originalDescription)
                    ) {
                      setIsEditing(false)
                      return
                    }

                    const validationResult =
                      validateField.description(trimmedDescription)
                    if (!validationResult.success) {
                      toast.error(getValidationError(validationResult))
                      return
                    }

                    mutations.updateProduct.mutateAsync({
                      productId: row.original._id,
                      description: trimmedDescription,
                    })
                    setIsEditing(false)
                  }}
                >
                  <Label
                    htmlFor={`${row.original._id}-description`}
                    className="sr-only"
                  >
                    Description
                  </Label>
                  <Textarea
                    name="description"
                    className="w-full min-w-0 min-h-[4rem] max-h-40 sm:min-h-[2.5rem] sm:max-h-32 resize-y text-sm"
                    defaultValue={description}
                    id={`${row.original._id}-description`}
                    placeholder="Enter description..."
                    autoFocus
                    onBlur={(e) => {
                      const value = e.currentTarget.value
                      const validationResult = validateField.description(
                        value?.trim() || null,
                      )
                      if (!validationResult.success) {
                        toast.error(getValidationError(validationResult))
                        setIsEditing(false)
                        return
                      }
                      e.currentTarget.form?.requestSubmit()
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setIsEditing(false)
                      }
                      if (e.key === 'Enter' && e.ctrlKey) {
                        const value = e.currentTarget.value
                        const validationResult = validateField.description(
                          value?.trim() || null,
                        )
                        if (!validationResult.success) {
                          toast.error(getValidationError(validationResult))
                          setIsEditing(false)
                          return
                        }
                        e.currentTarget.form?.requestSubmit()
                      }
                    }}
                  />
                </form>
              </div>
            )
          }

          return (
            <div
              className="min-w-0 cursor-pointer hover:bg-input/30 rounded p-1 min-h-[4rem] sm:min-h-[2.5rem] flex items-start"
              onClick={() => setIsEditing(true)}
              title={description || 'Click to add description'}
            >
              <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words w-full leading-relaxed">
                {description
                  ? description.length > 100
                    ? description.substring(0, 100) + '...'
                    : description
                  : 'No description'}
              </p>
            </div>
          )
        },
        size: 250,
        minSize: 150,
        maxSize: 400,
      },
      {
        accessorKey: 'category',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              className="h-auto p-0 font-medium hover:bg-transparent gap-2 justify-start w-fit min-w-[150px]"
            >
              Category
              {column.getIsSorted() === 'asc' ? (
                <ChevronUpIcon className="size-4" />
              ) : column.getIsSorted() === 'desc' ? (
                <ChevronDownIcon className="size-4" />
              ) : (
                <ArrowUpDownIcon className="size-4" />
              )}
            </Button>
          )
        },
        cell: ({ row }) => {
          if (!categories) {
            return (
              <div className="w-full">
                <Badge
                  variant="outline"
                  className="px-2 py-1 text-sm text-muted-foreground capitalize"
                >
                  {row.original.category}
                </Badge>
              </div>
            )
          }

          return (
            <div className="w-full">
              <Select
                value={row.original.category}
                onValueChange={(value) => {
                  if (value === row.original.category) {
                    return
                  }

                  const validationResult = validateField.category(value)
                  if (!validationResult.success) {
                    toast.error(getValidationError(validationResult))
                    return
                  }

                  mutations.updateProduct.mutateAsync({
                    productId: row.original._id,
                    category: value as string,
                  })
                }}
              >
                <SelectTrigger className="h-8 border-transparent bg-transparent shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background pl-0 pr-0 w-fit min-w-[140px]">
                  <SelectValue>
                    <Badge
                      variant="outline"
                      className="px-2 py-1 text-sm text-muted-foreground capitalize"
                    >
                      {row.original.category}
                    </Badge>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      <span className="capitalize text-sm">{category}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        },
        size: 150,
        minSize: 150,
        maxSize: 200,
      },
      {
        accessorKey: 'price',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              className="h-auto p-0 font-medium hover:bg-transparent gap-2 justify-start w-full"
            >
              Price
              {column.getIsSorted() === 'asc' ? (
                <ChevronUpIcon className="size-4" />
              ) : column.getIsSorted() === 'desc' ? (
                <ChevronDownIcon className="size-4" />
              ) : (
                <ArrowUpDownIcon className="size-4" />
              )}
            </Button>
          )
        },
        cell: ({ row }) => {
          const price = parseFloat(row.getValue('price'))
          const formatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(price)

          const [isEditing, setIsEditing] = React.useState(false)

          if (isEditing) {
            return (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const priceInput = formData.get('price') as string
                  const newPrice = parseFloat(priceInput)

                  const validationResult = validateField.price(newPrice)
                  if (!validationResult.success) {
                    toast.error(getValidationError(validationResult))
                    setIsEditing(false)
                    return
                  }

                  if (Math.abs(newPrice - row.original.price) < 0.001) {
                    setIsEditing(false)
                    return
                  }

                  mutations.updateProduct.mutateAsync({
                    productId: row.original._id,
                    price: newPrice,
                  })
                  setIsEditing(false)
                }}
              >
                <Label
                  htmlFor={`${row.original._id}-price`}
                  className="sr-only"
                >
                  Price
                </Label>
                <Input
                  name="price"
                  className="h-9 w-full px-1 border-transparent bg-transparent text-left shadow-none hover:bg-input/30  focus-visible:bg-background text-sm"
                  defaultValue={row.original.price.toFixed(2)}
                  id={`${row.original._id}-price`}
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="999.99"
                  autoFocus
                  onBlur={(e) => {
                    const input = e.currentTarget
                    const value = parseFloat(input.value)

                    const validationResult = validateField.price(value)
                    if (!validationResult.success) {
                      toast.error(getValidationError(validationResult))
                      setIsEditing(false)
                      return
                    }

                    input.value = value.toFixed(2)
                    e.currentTarget.form?.requestSubmit()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsEditing(false)
                    }
                  }}
                />
              </form>
            )
          }

          return (
            <div
              className="h-9 w-full flex items-center text-sm font-medium cursor-pointer hover:bg-input/30 rounded"
              onClick={() => setIsEditing(true)}
            >
              {formatted}
            </div>
          )
        },
        size: 120,
        minSize: 80,
        maxSize: 150,
      },
      {
        accessorKey: 'available',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              className="h-auto p-0 font-medium hover:bg-transparent gap-2 justify-start w-full"
            >
              Status
              {column.getIsSorted() === 'asc' ? (
                <ChevronUpIcon className="size-4" />
              ) : column.getIsSorted() === 'desc' ? (
                <ChevronDownIcon className="size-4" />
              ) : (
                <ArrowUpDownIcon className="size-4" />
              )}
            </Button>
          )
        },
        cell: ({ row }) => {
          if (!statuses) {
            return (
              <Badge
                variant="outline"
                className="flex gap-1 px-2 py-1 text-sm text-muted-foreground [&_svg]:size-3"
              >
                {row.original.available ? (
                  <CheckCircle2Icon className="text-white dark:text-black fill-green-500" />
                ) : (
                  <XCircleIcon className="text-white dark:text-black fill-red-500" />
                )}
                {row.original.available ? 'Available' : 'Unavailable'}
              </Badge>
            )
          }

          return (
            <div className="w-full flex justify-start">
              <Select
                value={(row.original.available ?? true).toString()}
                onValueChange={(value) => {
                  const newAvailable = value === 'true'

                  if (newAvailable === row.original.available) {
                    return
                  }

                  const validationResult = validateField.available(newAvailable)
                  if (!validationResult.success) {
                    toast.error(getValidationError(validationResult))
                    return
                  }

                  mutations.updateAvailability.mutate({
                    productId: row.original._id,
                    available: newAvailable,
                  })
                }}
              >
                <SelectTrigger className="h-8 border-transparent bg-transparent shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background pl-0 pr-0 w-fit min-w-[140px]">
                  <SelectValue>
                    <Badge
                      variant="outline"
                      className="flex gap-1 px-2 py-1 text-sm text-muted-foreground [&_svg]:size-4"
                    >
                      {row.original.available ? (
                        <CheckCircle2Icon className="text-white dark:text-black fill-green-500" />
                      ) : (
                        <XCircleIcon className="text-white dark:text-black fill-red-500" />
                      )}
                      {row.original.available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem
                      key={status.value.toString()}
                      value={status.value.toString()}
                    >
                      <div className="flex items-center gap-1 text-sm [&_svg]:size-4">
                        {status.value ? (
                          <CheckCircle2Icon className="size-3 text-white dark:text-black fill-green-500" />
                        ) : (
                          <XCircleIcon className="size-3 text-white dark:text-black fill-red-500" />
                        )}
                        {status.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        },
        enableResizing: false,
        size: 160,
        minSize: 120,
        maxSize: 200,
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex size-9 text-muted-foreground data-[state=open]:bg-muted"
                  size="icon"
                >
                  <MoreVerticalIcon className="size-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem
                  onClick={() => setEditingProductId(row.original._id)}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const duplicateData = {
                      name: `${row.original.name} (Copy)`,
                      description: row.original.description,
                      category: row.original.category,
                      price: row.original.price,
                      available: (row.original.available = false),
                      imageId: row.original.imageId,
                    }
                    handleAddProduct(duplicateData as ProductFormData)
                  }}
                >
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-red-600"
                      onSelect={(e) => e.preventDefault()}
                    >
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Product</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{row.original.name}"?
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          mutations.deleteProduct.mutate({
                            productId: row.original._id,
                          })
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        enableResizing: false,
        size: 60,
        minSize: 60,
        maxSize: 60,
      },
    ],
    [categories, statuses, mutations, editingProductId, setEditingProductId],
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map((item) => item._id) || [],
    [data],
  )

  const table = useReactTable({
    data: data,
    columns,
    defaultColumn: {
      maxSize: 500,
    },
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
      columnSizing,
    },
    getRowId: (row) => row._id,
    enableRowSelection: true,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    autoResetPageIndex: false,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const columnSizeVars = React.useMemo(() => {
    const headers = table.getFlatHeaders()
    const colSizes: { [key: string]: number } = {}
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]!
      colSizes[`--header-${header.id}-size`] = header.getSize()
      colSizes[`--col-${header.column.id}-size`] = header.column.getSize()
    }
    return colSizes
  }, [table.getState().columnSizingInfo, table.getState().columnSizing])

  const getColumnWidth = (columnId: string) => {
    const defaultWidths: Record<string, number> = {
      image: 100,
      select: 48,
      name: 100,
      description: 250,
      category: 120,
      price: 120,
      available: 160,
      actions: 60,
    }
    return defaultWidths[columnId] || 150
  }

  const skeletonTable = useReactTable({
    data: [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isPending) {
    return (
      <div className="flex w-full flex-col justify-start gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-80" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              {skeletonTable.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className="relative"
                    >
                      <Skeleton className="h-4 w-16" />
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {skeletonTable.getAllColumns().map((column) => (
                    <TableCell key={column.id}>
                      <Skeleton className="h-6 w-full max-w-32" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter products..."
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('name')?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Delete Selected (
                  {table.getFilteredSelectedRowModel().rows.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Selected Products</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete{' '}
                    {table.getFilteredSelectedRowModel().rows.length} selected
                    product(s)? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      const selectedIds = table
                        .getFilteredSelectedRowModel()
                        .rows.map((row) => row.original._id)
                      mutations.bulkDeleteProducts.mutate({
                        productIds: selectedIds,
                      })
                      table.resetRowSelection()
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete Selected
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ColumnsIcon />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== 'undefined' &&
                    column.getCanHide(),
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <AddProductDialog
            onAddProduct={handleAddProduct}
            categories={categories}
            isSubmitting={mutations.addProduct.isPending}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <Table
            style={{
              ...columnSizeVars,
              width: '100%',
            }}
          >
            <TableHeader className="sticky top-0 z-10 bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{
                          width: `calc(var(--header-${header.id}-size) * 1px)`,
                        }}
                        className="relative overflow-visible"
                      >
                        <div className="flex items-center relative h-full">
                          <div className="flex-1">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </div>
                        </div>
                        {header.column.getCanResize() && (
                          <div
                            onDoubleClick={() => header.column.resetSize()}
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            className={cn(
                              'absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none bg-border hover:bg-primary',
                              'opacity-0 hover:opacity-100 transition-opacity',
                              header.column.getIsResizing() &&
                                'bg-primary opacity-100',
                            )}
                          />
                        )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                <SortableContext
                  items={dataIds}
                  strategy={verticalListSortingStrategy}
                >
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => {
                        const width = getColumnWidth(cell.column.id)
                        return (
                          <TableCell
                            key={cell.id}
                            style={{
                              width: `${width}px`,
                              minWidth: `${width}px`,
                              maxWidth: `${width}px`,
                            }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </SortableContext>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="w-20" id="rows-per-page">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeftIcon />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRightIcon />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
