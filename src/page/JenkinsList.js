
import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';


function JenkinsList() {
  const [jenkinsData, setJenkinsData] = useState([]);
  const [selectedJenkins, setSelectedJenkins] = useState(null);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const toast = useRef(null);

  const fetchJenkins = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/jenkins");
      const data = await response.json();
      let items = Array.isArray(data.builds) ? data.builds : [];
      // Her build için detay endpointine fetch at
      const detailedBuilds = await Promise.all(
        items.map(async (build) => {
          try {
            const detailRes = await fetch(`http://localhost:3001/api/jenkins/${build.number}/api/json?pretty=true`);
            const detail = await detailRes.json();
            const fullDetail = detail && Object.keys(detail).length > 0 ? detail : build;
            // parametersString ekle
            const params = fullDetail.actions?.flatMap(a => a.parameters || []);
            fullDetail.parametersString = params && params.length > 0
              ? params.map(p => `${p.value}`).join(", ")
              : "";
            return fullDetail;
          } catch {
            build.parametersString = "";
            return build;
          }
        })
      );
      setJenkinsData(detailedBuilds);
      toast.current?.show({
        severity: "success",
        summary: "Başarılı",
        detail: "Jenkins verisi yüklendi (detaylı)",
        life: 1200,
      });
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Hata",
        detail: "Jenkins verisi alınamadı",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Build detayını çekmek için fonksiyon
  const fetchBuildDetail = async (number) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/jenkins/${number}/api/json?pretty=true`
      );
      const detail = await response.json();
      console.log('Build detail:', detail);
      // Eğer detail boş obje veya array ise uyarı göster
      if (!detail || (Array.isArray(detail) && detail.length === 0) || (typeof detail === 'object' && Object.keys(detail).length === 0)) {
        setSelectedJenkins(null);
        toast.current?.show({
          severity: "warn",
          summary: `Build #${number} Detay`,
          detail: `Detay verisi bulunamadı veya boş!`,
          life: 3000,
        });
        return;
      }
      setSelectedJenkins(detail);
      toast.current?.show({
        severity: "info",
        summary: `Build #${number} Detay`,
        detail: `Build detayları yüklendi!`,
        life: 2000,
      });
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Detay Hatası",
        detail: "Build detayı alınamadı",
        life: 3000,
      });
    }
  };

  return (
    <div style={{ margin: "0 auto", padding: 24 }}>
      <Toast ref={toast} position="top-right" />
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Button
          label="Jenkins Verilerini Yükle"
          icon="pi pi-refresh"
          className="p-button-info"
          onClick={fetchJenkins}
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
        value={jenkinsData}
        paginator
        rows={10}
        loading={loading}
        showGridlines={true}
        scrollable
        scrollHeight="70vh"
        emptyMessage="Kayıt bulunamadı."
        style={{ fontSize: 15 }}
        globalFilter={globalFilter}
        globalFilterFields={[
          "number",
          "result",
          "parametersString",
          "timestamp",
          "url",
        ]}
      >
        <Column field="number" header="Build No" style={{ minWidth: 100 }} />
        <Column field="result" header="Sonuç" style={{ minWidth: 100 }} />
        <Column
          header="Parameters"
          style={{ minWidth: 180 }}
          field="parametersString"
        />
        <Column
          field="timestamp"
          header="Tarih"
          style={{ minWidth: 180 }}
          body={(rowData) => {
            if (!rowData.timestamp) return "-";
            try {
              return new Date(rowData.timestamp).toLocaleString("tr-TR", {
                timeZone: "Europe/Istanbul",
              });
            } catch {
              return new Date(rowData.timestamp).toLocaleString();
            }
          }}
        />
        <Column
          field="url"
          header="Build URL"
          body={(rowData) =>
            rowData.url ? (
              <a href={rowData.url} target="_blank" rel="noopener noreferrer">
                {rowData.url}
              </a>
            ) : (
              "-"
            )
          }
        />
        {/* <Column
          header="Detay"
          body={(rowData) => (
            <Button
              label="Detay"
              icon="pi pi-search"
              className="p-button-sm p-button-secondary"
              onClick={() => fetchBuildDetail(rowData.number)}
            />
          )}
          style={{ minWidth: 120 }}
        /> */}
      </DataTable>

      {/* {selectedJenkins && (
        <div style={{ marginTop: 32 }}>
          <h3>Seçili Build Detayı</h3>
          <div
            style={{
              background: "#f4f4f4",
              padding: 16,
              borderRadius: 8,
              maxWidth: 800,
              overflow: "auto",
            }}
          >
            <div>
              <b>Numara:</b> {selectedJenkins.number}
            </div>
            <div>
              <b>Sonuç:</b> {selectedJenkins.result}
            </div>
            <div>
              <b>Durum:</b> {selectedJenkins.building}
            </div>
            <div>
              <b>Tarih:</b>{" "}
              {selectedJenkins.timestamp
                ? new Date(selectedJenkins.timestamp).toLocaleString()
                : "-"}
            </div>
            <div>
              <b>URL:</b>{" "}
              <a
                href={selectedJenkins.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {selectedJenkins.url}
              </a>
            </div>
            <details style={{ marginTop: 12 }}>
              <summary>Tüm JSON Detayı</summary>
              <pre
                style={{
                  background: "#eaeaea",
                  padding: 8,
                  borderRadius: 4,
                  maxHeight: 300,
                  overflow: "auto",
                }}
              >
                {JSON.stringify(selectedJenkins, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )} */}
    </div>
  );
}

export default JenkinsList