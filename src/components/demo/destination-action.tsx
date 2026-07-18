import { destinationActionFor } from "@/lib/destination-trust";

export function DestinationAction({ jobId, onOpen, className = "button-primary justify-center", statusClassName = "rounded-xl bg-[#fff4d8] px-4 py-3 text-center text-sm font-bold text-[#6c5731]" }: { jobId: string; onOpen?: () => void; className?: string; statusClassName?: string }) {
  const action = destinationActionFor(jobId);
  if (action.href) {
    return <a data-destination-state={action.state} href={action.href} target="_blank" rel="noopener noreferrer" onClick={onOpen} className={className}>{action.label}</a>;
  }
  return <div data-destination-state={action.state} role="status" className={statusClassName}>{action.label}</div>;
}
