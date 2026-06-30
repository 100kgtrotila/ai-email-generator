import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 p-4 text-center">
      <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100">
        <div className="rounded-full bg-slate-100 p-3 text-slate-500">
          <SearchX className="size-8" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          404 - Сторінку не знайдено
        </h2>
        <p className="text-sm text-slate-500">
          Схоже, ви перейшли за недійсним посиланням або сторінка була видалена.
        </p>

        <Button asChild className="mt-4 w-full gap-2">
          <Link href="/">
            <Home className="size-4" />
            Повернутися на головну
          </Link>
        </Button>
      </div>
    </div>
  );
}
