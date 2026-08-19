import { prisma } from "@/lib/db";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function AdminSettings() {
  const settings = Object.fromEntries((await prisma.setting.findMany()).map(s => [s.key, s.value]));
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
