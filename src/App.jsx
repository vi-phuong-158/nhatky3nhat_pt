import { useState, useEffect } from 'react';
import './App.css';
import SubmitForm from './components/SubmitForm';
import ScrapbookViewer from './components/ScrapbookViewer';
import { fetchEntries } from './services/api';

function App() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchEntries();
      setEntries(data);
      setError(null);
    } catch (err) {
      setError("Không thể lấy dữ liệu từ máy chủ. Đang hiển thị bản nháp mố phỏng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="scrapbook-container">
      {/* Trang trái: Form gửi bài */}
      <div className="scrapbook-page">
        <SubmitForm onFormSuccess={loadData} />
      </div>
      {/* Trang phải: Scrapbook Viewer */}
      <ScrapbookViewer entries={entries} />
    </div>
  );
}

export default App;
