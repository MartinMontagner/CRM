import { Role } from "@/model/auth/AuthData";
import { useAppStore } from "@/state/store";
import { Button, Menu } from "@mantine/core";
import "@mantine/core/styles.css";
import { useState } from "react";
import NavbarLayout from "../components/layout/NavbarLayout";
import "@fontsource/poppins/700.css"; // en su variacion bold
import MemberSubscriptionTable from "@/components/members/MemberSubscriptionTable";

type TableKey = "miembros";

function MemberSubscriptionPage() {
  const [selectedTable, setSelectedTable] = useState<TableKey>("miembros");
  const authData = useAppStore((state) => state.authData);
  const isAdmin = authData?.roles.includes(Role.ADMIN);

  console.log(authData?.roles)

  // Define all possible table options
  const allTableOptions: Record<
    TableKey,
    { label: string; component: JSX.Element }
  > = {
    miembros: { label: "Miembros", component: <MemberSubscriptionTable /> },
  };

  // Filter table options based on admin status
  const tableOptions = Object.fromEntries(
    Object.entries(allTableOptions).filter(
      ([key]) => key !== "parameters" || isAdmin
    )
  ) as Record<TableKey, { label: string; component: JSX.Element }>;

  const handleSelect = (option: TableKey) => {
    setSelectedTable(option);
  };

  // Ensure selected table is available for the current user
  const currentTable = Object.keys(tableOptions).includes(selectedTable)
    ? selectedTable
    : "miembros";

    return (
        <NavbarLayout>
            <div className="flex h-full w-full flex-col gap-4 px-6 py-4 sm:px-10 sm:py-6 xl:px-12 bg-grey-200">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">{tableOptions[currentTable].label}</h1>

          <Menu shadow="md" width={200} withinPortal>
            <Menu.Target>
              <Button
                className="bg-primary-600 hidden font-semibold hover:bg-primary-100 no-outline"
                style={{ fontFamily: "Poppins", fontWeight: "bold" }}
              >
                {tableOptions[currentTable].label}
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              {Object.entries(tableOptions).map(([key, option]) => (
                <Menu.Item
                  key={key}
                  onClick={() => handleSelect(key as TableKey)}
                >
                  {option.label}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        </div>

        {tableOptions[currentTable].component}
      </div>
    </NavbarLayout>
  );
}

export default MemberSubscriptionPage;
