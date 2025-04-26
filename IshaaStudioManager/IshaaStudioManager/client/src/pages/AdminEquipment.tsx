import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRequireAdmin } from "@/hooks/useAdmin";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { PlusIcon, Edit, Trash, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Define form schema
const equipmentFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  available: z.coerce.number().min(0, "Available must be at least 0")
});

type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;

export default function AdminEquipment() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  
  // Fetch equipment
  const {
    data: equipment = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/equipment"],
  });
  
  // Initialize form for adding equipment
  const addForm = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      name: "",
      quantity: 1,
      available: 1,
    },
  });
  
  // Initialize form for editing equipment
  const editForm = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      name: "",
      quantity: 1,
      available: 1,
    },
  });
  
  // Create equipment mutation
  const createEquipment = useMutation({
    mutationFn: async (data: EquipmentFormValues) => {
      const response = await apiRequest("POST", "/api/equipment", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Equipment Added",
        description: "The equipment has been added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      setIsAddDialogOpen(false);
      addForm.reset();
    },
    onError: () => {
      toast({
        title: "Add Failed",
        description: "Failed to add equipment",
        variant: "destructive",
      });
    },
  });
  
  // Update equipment mutation
  const updateEquipment = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: EquipmentFormValues }) => {
      const response = await apiRequest("PUT", `/api/equipment/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Equipment Updated",
        description: "The equipment has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      setIsEditDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update equipment",
        variant: "destructive",
      });
    },
  });
  
  // Delete equipment mutation
  const deleteEquipment = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/equipment/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Equipment Deleted",
        description: "The equipment has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      setIsDeleteDialogOpen(false);
      setSelectedEquipment(null);
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete equipment",
        variant: "destructive",
      });
    },
  });
  
  // Handle add form submission
  function onAddSubmit(data: EquipmentFormValues) {
    createEquipment.mutate(data);
  }
  
  // Handle edit form submission
  function onEditSubmit(data: EquipmentFormValues) {
    if (selectedEquipment) {
      updateEquipment.mutate({ id: selectedEquipment.id, data });
    }
  }
  
  // Handle delete confirmation
  function onDeleteConfirm() {
    if (selectedEquipment) {
      deleteEquipment.mutate(selectedEquipment.id);
    }
  }
  
  // Open edit dialog with equipment data
  function openEditDialog(equipment: any) {
    setSelectedEquipment(equipment);
    editForm.reset({
      name: equipment.name,
      quantity: equipment.quantity,
      available: equipment.available,
    });
    setIsEditDialogOpen(true);
  }
  
  // Open delete dialog
  function openDeleteDialog(equipment: any) {
    setSelectedEquipment(equipment);
    setIsDeleteDialogOpen(true);
  }
  
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="mb-6 bg-neutral-lightest p-4 rounded">
          <Skeleton className="h-7 w-40 mb-4" />
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-10 flex-grow" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
        <div className="space-y-2">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive">Failed to load equipment</p>
        <Button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/equipment"] })}
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      {/* Add Equipment Form */}
      <div className="mb-6 bg-neutral-lightest p-4 rounded">
        <h3 className="text-lg font-medium mb-4">Add New Equipment</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex-grow">
            <Input 
              type="text" 
              placeholder="Equipment Name" 
              value={addForm.watch("name")}
              onChange={(e) => addForm.setValue("name", e.target.value)}
            />
          </div>
          <div className="w-32">
            <Input 
              type="number" 
              placeholder="Quantity" 
              min="1"
              value={addForm.watch("quantity")}
              onChange={(e) => addForm.setValue("quantity", parseInt(e.target.value))}
            />
          </div>
          <div>
            <Button 
              className="px-4 py-2 bg-primary text-white rounded font-medium hover:bg-primary-dark transition flex items-center space-x-1"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Equipment List */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-neutral-lightest border-b">
            <tr>
              <th className="py-3 px-4 text-left font-medium text-neutral-dark">ID</th>
              <th className="py-3 px-4 text-left font-medium text-neutral-dark">Equipment Name</th>
              <th className="py-3 px-4 text-left font-medium text-neutral-dark">Quantity</th>
              <th className="py-3 px-4 text-left font-medium text-neutral-dark">Available</th>
              <th className="py-3 px-4 text-left font-medium text-neutral-dark">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-light">
            {equipment.length > 0 ? (
              equipment.map((item: any) => (
                <tr key={item.id} className="hover:bg-neutral-lightest">
                  <td className="py-3 px-4">{item.id}</td>
                  <td className="py-3 px-4">{item.name}</td>
                  <td className="py-3 px-4">{item.quantity}</td>
                  <td className="py-3 px-4">{item.available}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-info/10 text-info"
                        title="Edit"
                        onClick={() => openEditDialog(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-destructive/10 text-destructive"
                        title="Delete"
                        onClick={() => openDeleteDialog(item)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-4 text-center text-neutral-medium">
                  No equipment found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Add Equipment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Equipment</DialogTitle>
            <DialogDescription>
              Enter the details for the new equipment
            </DialogDescription>
          </DialogHeader>
          
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipment Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="available"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createEquipment.isPending}
                >
                  {createEquipment.isPending ? "Adding..." : "Add Equipment"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Equipment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Equipment</DialogTitle>
            <DialogDescription>
              Update the equipment details
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipment Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="available"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max={editForm.watch("quantity")}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateEquipment.isPending}
                >
                  {updateEquipment.isPending ? "Updating..." : "Update Equipment"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Equipment Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Equipment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedEquipment?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground"
              onClick={onDeleteConfirm}
              disabled={deleteEquipment.isPending}
            >
              {deleteEquipment.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
