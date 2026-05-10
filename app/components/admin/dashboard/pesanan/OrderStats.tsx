import { ClipboardList, Box, CheckCircle2, TrendingUp } from "lucide-react";

interface OrderStatsProps {
  orders: any[];
}

export default function OrderStats({ orders }: OrderStatsProps) {
  // Hitung jumlah berdasarkan status secara dinamis
  const countStatus = (status: string) => orders.filter(o => o.status === status).length;
  
  // Hitung total pendapatan hari ini (asumsi field 'total' ada di model Order)
  const todayRevenue = orders
    .filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString())
    .reduce((acc, curr) => acc + curr.total, 0);

  const stats = [
    { label: "MENUNGGU", value: countStatus("PENDING"), icon: <ClipboardList className="text-amber-600" />, color: "bg-amber-50" },
    { label: "DIPROSES", value: countStatus("PROSES"), icon: <Box className="text-blue-600" />, color: "bg-blue-50" },
    { label: "SELESAI", value: countStatus("SELESAI"), icon: <CheckCircle2 className="text-emerald-600" />, color: "bg-emerald-50" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-50 flex items-center gap-4">
          <div className={`p-3 rounded-xl ${stat.color}`}>{stat.icon}</div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{stat.label}</p>
            <p className="text-2xl font-black text-slate-800">{stat.value}</p>
          </div>
        </div>
      ))}
      
      <div className="bg-[#062C2C] p-6 rounded-2xl shadow-sm flex justify-between items-center overflow-hidden relative">
        <div className="relative z-10">
          <p className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">OMSET HARI INI</p>
          <p className="text-xl font-black text-white">
            Rp {new Intl.NumberFormat("id-ID").format(todayRevenue)}
          </p>
        </div>
        <TrendingUp className="text-emerald-500/30 w-12 h-12 absolute -right-2 -bottom-2" />
      </div>
    </div>
  );
}