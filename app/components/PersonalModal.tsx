import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface PersonModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (person: Partial<Person>) => void
  person?: Person
}

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

export function PersonModal({ isOpen, onClose, onSave, person }: PersonModalProps) {
  const [formData, setFormData] = useState<Partial<Person>>({
    NOMBRE_APELLIDO: "",
    TELEFONO: "",
    JUEVES: 0,
    VIERNES: 0,
    SABADO: 0,
    DOMINGO: 0,
    RECIBIDO: 0,
    ENVIADO: 0,
  })

  const resetForm = () => {
    setFormData({
      NOMBRE_APELLIDO: "",
      TELEFONO: "",
      JUEVES: 0,
      VIERNES: 0,
      SABADO: 0,
      DOMINGO: 0,
      RECIBIDO: 0,
      ENVIADO: 0,
    })
  }

  useEffect(() => {
    if (person) {
      setFormData(person)
    } else {
      resetForm()
    }
  }, [person, isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked ? 1 : 0 }))
  }

  const handleSave = () => {
    onSave(formData)
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{person ? "Editar Persona" : "Agregar Persona"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nombre" className="text-right">
              Nombre
            </Label>
            <Input
              id="nombre"
              name="NOMBRE_APELLIDO"
              value={formData.NOMBRE_APELLIDO}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="telefono" className="text-right">
              Teléfono
            </Label>
            <Input
              id="telefono"
              name="TELEFONO"
              value={formData.TELEFONO}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Días</Label>
            <div className="col-span-3 flex space-x-2">
              <Checkbox
                id="jueves"
                checked={formData.JUEVES === 1}
                onCheckedChange={(checked) => handleCheckboxChange("JUEVES", checked as boolean)}
              />
              <Label htmlFor="jueves">Jueves</Label>
              <Checkbox
                id="viernes"
                checked={formData.VIERNES === 1}
                onCheckedChange={(checked) => handleCheckboxChange("VIERNES", checked as boolean)}
              />
              <Label htmlFor="viernes">Viernes</Label>
              <Checkbox
                id="sabado"
                checked={formData.SABADO === 1}
                onCheckedChange={(checked) => handleCheckboxChange("SABADO", checked as boolean)}
              />
              <Label htmlFor="sabado">Sábado</Label>
              <Checkbox
                id="domingo"
                checked={formData.DOMINGO === 1}
                onCheckedChange={(checked) => handleCheckboxChange("DOMINGO", checked as boolean)}
              />
              <Label htmlFor="domingo">Domingo</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}