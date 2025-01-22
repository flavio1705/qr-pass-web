"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { PersonModal } from "./components/PersonalModal"
interface Person {
  id: string
  NOMBRE_APELLIDO: string
  TELEFONO: string
  JUEVES: number
  VIERNES: number
  SABADO: number
  DOMINGO: number
  RECIBIDO: number
  ENVIADO: number
}

const ITEMS_PER_PAGE = 20

export default function Home() {
  const [data, setData] = useState<Person[]>([])
  const [filteredData, setFilteredData] = useState<Person[]>([])
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState<{ recibido: string; enviado: string }>({ recibido: "all", enviado: "all" })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Person | undefined>(undefined)

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "personas"))
      const fetchedData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Person[]
      fetchedData.sort((a, b) => Number(a.id) - Number(b.id))
      setData(fetchedData)
      setFilteredData(fetchedData)
      setLoading(false)
    }

    fetchData()
  }, [])

  useEffect(() => {
    const filtered = data.filter((person) => {
      const recibidomatch = filter.recibido === "all" || person.RECIBIDO === Number.parseInt(filter.recibido)
      const enviadomatch = filter.enviado === "all" || person.ENVIADO === Number.parseInt(filter.enviado)
      return recibidomatch && enviadomatch
    })
    setFilteredData(filtered)
    setCurrentPage(1)
  }, [filter, data])

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]))
  }

  const sendWhatsApp = async (ids: string[]) => {
    try {
      const response = await fetch("/api/send-whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
      })

      if (!response.ok) {
        throw new Error("Failed to send WhatsApp messages")
      }

      const result = await response.json()
      toast.success(`Sent ${result.sentCount} WhatsApp messages with QR codes`)

      // Update ENVIADO status in Firebase
      for (const id of ids) {
        await updateDoc(doc(db, "personas", id), {
          ENVIADO: 1,
        })
      }

      // Update local state
      setData((prevData) => prevData.map((person) => (ids.includes(person.id) ? { ...person, ENVIADO: 1 } : person)))
    } catch (error) {
      console.log(error);
      toast.error("Failed to send WhatsApp messages")
    }
  }

  const handleAddPerson = () => {
    setEditingPerson(undefined)
    setIsModalOpen(true)
  }

  const handleEditPerson = (person: Person) => {
    setEditingPerson(person)
    setIsModalOpen(true)
  }

  const handleSavePerson = async (personData: Partial<Person>) => {
    try {
      if (editingPerson) {
        // Update existing person
        await updateDoc(doc(db, "personas", editingPerson.id), personData)
        setData((prevData) =>
          prevData.map((person) => (person.id === editingPerson.id ? { ...person, ...personData } : person)),
        )
        toast.success("Person updated successfully")
      } else {
        // Add new person
        const docRef = await addDoc(collection(db, "personas"), personData)
        const newPerson = { id: docRef.id, ...personData } as Person
        setData((prevData) => [...prevData, newPerson])
        toast.success("Person added successfully")
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to save person")
    }
  }

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Datos de Personas</h1>
      <div className="mb-4 flex space-x-4">
        <Select onValueChange={(value) => setFilter((prev) => ({ ...prev, recibido: value }))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por recibido" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="1">Recibido</SelectItem>
            <SelectItem value="0">No recibido</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => setFilter((prev) => ({ ...prev, enviado: value }))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por enviado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="1">Enviado</SelectItem>
            <SelectItem value="0">No enviado</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleAddPerson}>Agregar Persona</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Select</TableHead>
            <TableHead>Nombre y Apellido</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Jueves</TableHead>
            <TableHead>Viernes</TableHead>
            <TableHead>Sábado</TableHead>
            <TableHead>Domingo</TableHead>
            <TableHead>Recibido</TableHead>
            <TableHead>Enviado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((person) => (
            <TableRow key={person.id}>
              <TableCell>
                <Checkbox checked={selectedRows.includes(person.id)} onCheckedChange={() => toggleRow(person.id)} />
              </TableCell>
              <TableCell>{person.NOMBRE_APELLIDO}</TableCell>
              <TableCell>{person.TELEFONO}</TableCell>
              <TableCell>{person.JUEVES}</TableCell>
              <TableCell>{person.VIERNES}</TableCell>
              <TableCell>{person.SABADO}</TableCell>
              <TableCell>{person.DOMINGO}</TableCell>
              <TableCell>{person.RECIBIDO}</TableCell>
              <TableCell>{person.ENVIADO}</TableCell>
              <TableCell>
                <Button onClick={() => sendWhatsApp([person.id])} className="mr-2">
                  Enviar WhatsApp
                </Button>
                <Button onClick={() => handleEditPerson(person)} variant="outline">
                  Editar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 flex justify-between items-center">
        <Button onClick={() => sendWhatsApp(selectedRows)} disabled={selectedRows.length === 0}>
          Enviar WhatsApp Masivo
        </Button>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                // disabled={currentPage === 1}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink onClick={() => setCurrentPage(index + 1)} isActive={currentPage === index + 1}>
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                // disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      <PersonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePerson}
        person={editingPerson}
      />
    </div>
  )
}