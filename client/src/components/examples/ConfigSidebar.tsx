import ConfigSidebar from "../ConfigSidebar";

export default function ConfigSidebarExample() {
  return (
    <div className="h-screen p-4">
      <ConfigSidebar
        onRunOptimization={(config) => console.log("Run optimization with config:", config)}
      />
    </div>
  );
}
