"use client"

import { Button } from "@/components/ui/button"
import { TextArea } from "@/components/ui/textArea"
import { api } from "@/lib/trpc"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"

interface NoteControlsProps {
  gameId: string
  defaultNotes: string | null,
}

export const NoteControls = ({ gameId, defaultNotes }: NoteControlsProps) => {
  const { mutateAsync, isPending } = useMutation(api.chess.updateNotes.mutationOptions())
  const [notes, setNotes] = useState(defaultNotes || "")

  const handleUpdate = async () => mutateAsync({ gameId, notes })

  return (
    <>
      <TextArea
        name="notes"
        value={notes}
        onChange={(e) => { setNotes(e.target.value) }}
        className="resize-none flex-1"
      />
        <Button
            label="Update"
            loading={isPending}
            onClick={handleUpdate}
            variant="outline"
            className="`rounded-none p-5!"
        />
    </>
  )
}
