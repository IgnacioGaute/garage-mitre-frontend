
import { Banknote, CreditCardIcon, User, Wallet } from 'lucide-react';
import CardOtherPayment from './components/create-other-payment-card';


export default async function OtherPaymentPage() {
  return (
    <div className="container mx-auto px-4 py-4 sm:p-6">
      <div className="w-3/5 mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-3 mb-6 sm:mb-8 bg-secondary/50 p-4 sm:p-6 rounded-xl backdrop-blur-sm">
          <Banknote className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Registrar Gastos</h1>
          </div>
        </div>
      </div>
        <CardOtherPayment />
    </div>
  );
}
