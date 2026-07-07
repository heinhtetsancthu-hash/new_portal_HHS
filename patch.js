const fs = require('fs');
let code = fs.readFileSync('src/components/DailyRecord.tsx', 'utf8');

const newStates = `
  const [name, setName] = useState('');
  const [category, setCategory] = useState('AA');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [cashAmount, setCashAmount] = useState('');
  const [bankingAmount, setBankingAmount] = useState('');
  const [records, setRecords] = useState<DailyRecordItem[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToDailyRecords((items) => {
      setRecords(items);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!name) {
      alert("Please enter customer name or reference.");
      return;
    }
    if (!isCash && !isBanking) {
      alert("Please select at least one payment method.");
      return;
    }

    const newItem: DailyRecordItem = {
      id: Date.now().toString(),
      name,
      category,
      date,
      isCash,
      isBanking,
      cashAmount: isCash ? parseFloat(cashAmount) || 0 : 0,
      bankingAmount: isBanking ? parseFloat(bankingAmount) || 0 : 0,
      createdAt: Date.now()
    };

    await saveDailyRecord(newItem);
    alert('Record Saved');
    setName('');
    setCashAmount('');
    setBankingAmount('');
    setActiveTab('records');
  };
`;

code = code.replace("const [isBanking, setIsBanking] = useState(false);", "const [isBanking, setIsBanking] = useState(false);\n" + newStates);

fs.writeFileSync('src/components/DailyRecord.tsx', code);
