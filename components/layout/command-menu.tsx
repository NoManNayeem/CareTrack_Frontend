"use client";

import { useQuery } from "@tanstack/react-query";
import { CornerDownLeft, Plus, Search, Stethoscope, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/spinner";
import { ConditionDot } from "@/components/feedback/condition-badge";
import { doctorsApi } from "@/features/doctors/api";
import { patientsApi } from "@/features/patients/api";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { NAV_ITEMS } from "./nav-items";

/** ⌘K — jump anywhere, search doctors & patients, run quick actions. */
export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search.trim(), 200);
  const router = useRouter();
  const enabled = open && q.length >= 2;

  const doctors = useQuery({
    queryKey: ["command", "doctors", q],
    queryFn: ({ signal }) => doctorsApi.list({ q, limit: 5 }, signal),
    enabled,
    staleTime: 30_000,
  });
  const patients = useQuery({
    queryKey: ["command", "patients", q],
    queryFn: ({ signal }) => patientsApi.list({ q, limit: 5 }, signal),
    enabled,
    staleTime: 30_000,
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setSearch("");
    router.push(href);
  };

  const lower = search.toLowerCase();
  const pages = NAV_ITEMS.filter((n) => !lower || n.label.toLowerCase().includes(lower));
  const loading = enabled && (doctors.isFetching || patients.isFetching);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-8 w-9 justify-center gap-2 px-0 font-normal text-muted-foreground sm:w-56 sm:justify-start sm:px-2.5"
        aria-label="Search (⌘K)"
      >
        <Search />
        <span className="hidden sm:inline">Search…</span>
        <KbdGroup className="ml-auto hidden sm:flex">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search CareTrack"
        description="Search doctors, patients and pages"
      >
        <Command shouldFilter={false}>
          <CommandInput value={search} onValueChange={setSearch} placeholder="Search doctors, patients, pages…" />
          <CommandList className="max-h-[min(420px,60vh)]">
            <CommandEmpty>
              {loading ? "Searching…" : q.length < 2 ? "Type at least 2 characters." : "No results found."}
            </CommandEmpty>

            {pages.length > 0 && (
              <CommandGroup heading="Go to">
                {pages.map((item) => (
                  <CommandItem key={item.href} value={`page-${item.href}`} onSelect={() => go(item.href)}>
                    <item.icon />
                    {item.label}
                    <span className="ml-auto text-xs text-muted-foreground">{item.description}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {!search && (
              <CommandGroup heading="Actions">
                <CommandItem value="action-new-doctor" onSelect={() => go("/doctors?new=true")}>
                  <Plus /> Add a doctor
                </CommandItem>
                <CommandItem value="action-critical" onSelect={() => go("/patients?condition=critical")}>
                  <ConditionDot condition="critical" className="mx-1" /> View critical patients
                </CommandItem>
              </CommandGroup>
            )}

            {enabled && (doctors.data?.data.length ?? 0) > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Doctors">
                  {doctors.data!.data.map((d) => (
                    <CommandItem key={d.id} value={`doctor-${d.id}`} onSelect={() => go(`/doctors/${d.id}`)}>
                      <Stethoscope />
                      <span className="truncate">{d.name}</span>
                      <span className="ml-auto truncate text-xs text-muted-foreground">{d.specialization}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {enabled && (patients.data?.data.length ?? 0) > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Patients">
                  {patients.data!.data.map((p) => (
                    <CommandItem
                      key={p.id}
                      value={`patient-${p.id}`}
                      onSelect={() => go(`/patients?q=${encodeURIComponent(p.name)}`)}
                    >
                      <UserRound />
                      <span className="truncate">{p.name}</span>
                      <span className="ml-auto flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                        <ConditionDot condition={p.condition} /> {p.diagnosis}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
          <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Kbd>
                <CornerDownLeft className="size-3" />
              </Kbd>
              to open
            </span>
            {loading && <Spinner className="size-3.5" />}
          </div>
        </Command>
      </CommandDialog>
    </>
  );
}
