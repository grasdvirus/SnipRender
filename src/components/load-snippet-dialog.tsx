
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";

type Snippet = {
  id: number;
  name: string;
  html: string;
  css: string;
  js: string;
  react: string;
  date: string;
};

interface LoadSnippetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snippets: Snippet[];
  onLoad: (snippet: Snippet) => void;
  onDelete: (id: number) => void;
}

export function LoadSnippetDialog({ open, onOpenChange, snippets, onLoad, onDelete }: LoadSnippetDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Charger un Extrait</DialogTitle>
          <DialogDescription>
            Sélectionnez un extrait précédemment sauvegardé pour le charger dans l'éditeur.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] -mx-4">
          <div className="px-4 space-y-2">
            {snippets.length > 0 ? (
              snippets.slice().reverse().map((snippet, index) => (
                <div key={snippet.id}>
                    <div className="flex items-center justify-between gap-4 py-3">
                        <div>
                        <p className="font-semibold">{snippet.name}</p>
                        <p className="text-sm text-muted-foreground">Sauvegardé le {snippet.date}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                        <Button size="sm" onClick={() => onLoad(snippet)}>Charger</Button>
                        <Button size="sm" variant="destructive" onClick={() => onDelete(snippet.id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Supprimer</span>
                        </Button>
                        </div>
                    </div>
                    <Separator />
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-12">Aucun extrait sauvegardé trouvé.</p>
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    