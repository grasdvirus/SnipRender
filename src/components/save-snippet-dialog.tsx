import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";

interface SaveSnippetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string) => void;
}

export function SaveSnippetDialog({ open, onOpenChange, onSave }: SaveSnippetDialogProps) {
  const [name, setName] = useState("");

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      setName("");
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { onOpenChange(isOpen); if (!isOpen) setName(''); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sauvegarder l'Extrait</DialogTitle>
           <DialogDescription>
            Entrez un nom pour votre extrait pour le sauvegarder pour une utilisation ultérieure.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">
              Nom de l'Extrait
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={handleKeyDown} placeholder="ex: Bouton Animé" autoFocus />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSave} disabled={!name.trim()}>Sauvegarder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
