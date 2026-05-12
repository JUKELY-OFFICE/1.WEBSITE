interface TeamCardProps {
  name: string;
  role: string;
}

export default function TeamCard({ name, role }: TeamCardProps) {
  return (
    <div
      className="flex flex-col items-center gap-4 rounded-xl border border-jukely-nuit/10 bg-white p-8 text-center"
      style={{ boxShadow: '0 1px 3px rgba(15,39,72,.04), 0 10px 30px rgba(15,39,72,.06)' }}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-jukely-nuit/10 text-2xl font-bold text-jukely-ardoise">
        {name[0]}
      </div>
      <div>
        <p className="font-semibold text-jukely-nuit">{name}</p>
        <p className="text-sm text-jukely-moutarde font-medium">{role}</p>
      </div>
    </div>
  );
}
