import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import React from 'react';
import { InputText } from 'primereact/inputtext';

function SnowList() {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [startDate, setStartDate] = React.useState(null);
  const [endDate, setEndDate] = React.useState(null);
  const [repos, setRepos] = React.useState([]);
  const [totalRecords, setTotalRecords] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const toast = React.useRef(null);

  // ServiceNow verisini backend proxy ile çek
  const loadSnowRepos = async () => {
    if (!startDate || !endDate) {
      toast.current?.show({
        severity: "warn",
        summary: "Uyarı",
        detail: "Lütfen tarih aralığı seçin",
        life: 2000,
      });
      return;
    }
    setLoading(true);
    try {
      // Tarihleri yyyy-mm-dd formatına çevir
      const formatDate = (d) => {
        const pad = (n) => n.toString().padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
          d.getDate()
        )}`;
      };
      const start = formatDate(startDate);
      const end = formatDate(endDate);
      // ServiceNow query stringini oluştur
      const uri = `/task_list.do?XML&sysparm_query=active=true^sys_class_name=rm_enhancement^ORsys_class_name=rm_defect^opened_atBETWEENjavascript:gs.dateGenerate('${start}','00:00:00')@javascript:gs.dateGenerate('${end}','00:00:00')^u_hitit_state=300^ORDERBYnumber&sysparm_display_value=true`;
      // Proxy endpointi ile fetch
      const response = await fetch(
        `http://localhost:3001/api/proxy/servicenow?uri=${encodeURIComponent(
          uri
        )}`
      );
      const data = await response.json();
      // Eğer body altında rm_defect ve rm_enhancement varsa birleştir
      let items = [];
      if (data.body) {
        const defects = Array.isArray(data.body.rm_defect) ? data.body.rm_defect : (data.body.rm_defect ? [data.body.rm_defect] : []);
        const enhancements = Array.isArray(data.body.rm_enhancement) ? data.body.rm_enhancement : (data.body.rm_enhancement ? [data.body.rm_enhancement] : []);
        items = [...defects, ...enhancements];
      } else if (Array.isArray(data.items)) {
        items = data.items;
      } else if (Array.isArray(data)) {
        items = data;
      }
      setRepos(items);
      console.log('ServiceNow response:', data);
      console.log('DataTable items:', items);
      setTotalRecords(items.length);
      toast.current?.show({
        severity: "success",
        summary: "Başarılı",
        detail: "Repositoryler yüklendi",
        life: 1200,
      });
    } catch (error) {
      console.log(error);
      toast.current?.show({
        severity: "error",
        summary: "Hata",
        detail: "Repositoryler alınamadı",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ margin: "0 auto", padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      ></div>
      <Toast ref={toast} position="top-right" />
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <span>Tarih Aralığı:</span>
        <Calendar
          value={startDate}
          onChange={(e) => setStartDate(e.value)}
          placeholder="Başlangıç"
          dateFormat="yy-mm-dd"
          showIcon
        />
        <span>-</span>
        <Calendar
          value={endDate}
          onChange={(e) => setEndDate(e.value)}
          placeholder="Bitiş"
          dateFormat="yy-mm-dd"
          showIcon
        />
        <Button
          label="ServiceNow Repo Yükle"
          icon="pi pi-database"
          className="p-button-info"
          onClick={loadSnowRepos}
          loading={loading}
        />
        <InputText
          variant="filled"
          type="text"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Global Search..."
        />
      </div>
      <DataTable
        value={repos}
        paginator
        rows={10}
        loading={loading}
        showGridlines={true}
        scrollable
        scrollHeight="80vh"
        emptyMessage="Kayıt bulunamadı."
        style={{ fontSize: 15 }}
        globalFilter={globalFilter}
        filterDisplay="row"
      >
        <Column
          field="opened_at"
          header="Opened At"
          style={{ minWidth: 120 }}
          filter
          filterPlaceholder="Ara..."
        />
        <Column
          field="number"
          header="Number"
          style={{ minWidth: 120 }}
          filter
          filterPlaceholder="Ara..."
        />
        <Column
          field="company"
          header="Company"
          style={{ minWidth: 120 }}
          filter
          filterPlaceholder="Ara..."
        />
        <Column
          field="u_release"
          header="Release"
          style={{ minWidth: 120 }}
          filter
          filterPlaceholder="Ara..."
        />
        <Column
          field="state"
          header="State"
          style={{ minWidth: 120 }}
          filter
          filterPlaceholder="Ara..."
        />
        <Column
          field="u_subcategory"
          header="Category"
          style={{ minWidth: 150 }}
          filter
          filterPlaceholder="Ara..."
          body={(rowData) =>
            rowData.u_subcategory || rowData.u_subcategory1 || "N/A"
          }
        />
        <Column
          field="assigned_to"
          header="Assigned To"
          style={{ minWidth: 150 }}
          filter
          filterPlaceholder="Ara..."
        />
        <Column
          field="sys_updated_by"
          header="Sys Updated By"
          style={{ minWidth: 140 }}
          filter
          filterPlaceholder="Ara..."
        />
        <Column
          field="sys_updated_on"
          header="Sys Updated On"
          style={{ minWidth: 160 }}
          filter
          filterPlaceholder="Ara..."
        />
      </DataTable>
    </div>
  );
}

export default SnowList