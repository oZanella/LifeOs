import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

export function DashboardFiltersLayout() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <Select>
        <SelectTrigger className="w-full sm:w-60">
          <SelectValue placeholder="Filtro 1" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Opção 1</SelectItem>
          <SelectItem value="2">Opção 2</SelectItem>
        </SelectContent>
      </Select>

      <Select>
        <SelectTrigger className="w-full sm:w-60">
          <SelectValue placeholder="Filtro 2" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Opção A</SelectItem>
          <SelectItem value="b">Opção B</SelectItem>
        </SelectContent>
      </Select>

      <Select>
        <SelectTrigger className="w-full sm:w-45">
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="jan">Janeiro</SelectItem>
          <SelectItem value="fev">Fevereiro</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
