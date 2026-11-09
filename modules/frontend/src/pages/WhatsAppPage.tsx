import NavbarLayout from "../components/layout/NavbarLayout";
import WhatsAppComponent from "../components/chat/WhatsAppComponent";

function WhatsAppPage() {
  return (
    <NavbarLayout>
      <div className="h-full w-full overflow-hidden">
        <WhatsAppComponent />
      </div>
    </NavbarLayout>
  );
}

export default WhatsAppPage;