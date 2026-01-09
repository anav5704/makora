"use client"

import { Select } from "@/components/ui/select"
import { useQueryState } from "nuqs"

export const View = () => {
  const [view, setView] = useQueryState("view")

  const viewOptions = [
      { id: 1, name: "List", value: "list" },
      { id: 2, name: "Grid", value: "grid" },
  ];

  return (
    <Select
      name="view"
      options={viewOptions}
      selectedItem={viewOptions.find((o) => o.value === view) ?? viewOptions[0]}
      setSelectedItem={(item) => setView(item.value)}
    />

  )
}
