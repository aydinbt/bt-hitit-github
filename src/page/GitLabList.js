import React, { useState, useRef, useEffect } from 'react';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Paginator } from 'primereact/paginator';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-cyan/theme.css';


function GitLabList() {
  const [commits, setCommits] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [filesModalVisible, setFilesModalVisible] = useState(false);
  const [modalFiles, setModalFiles] = useState([]);
  const [modalFilesPage, setModalFilesPage] = useState(0);
  const [modalFilesRows, setModalFilesRows] = useState(10);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 0 });
  const toast = useRef(null);

  const loadCommits = async (event = lazyParams) => {
    setLoading(true);
    try {
      const page = Math.floor((event.first || 0) / (event.rows || 10)) + 1;
      const pageSize = event.rows || 10;
      const filter = globalFilter
        ? `&filter=${encodeURIComponent(globalFilter)}`
        : "";
      const response = await fetch(
        `http://localhost:3001/api/gitlab/commits?page=${page}&pageSize=${pageSize}${filter}`
      );
      const data = await response.json();
      setCommits(data.items || []);
      setTotalRecords(data.total || 0);
      toast.current?.show({
        severity: "success",
        summary: "Başarılı",
        detail: "Commitler yüklendi",
        life: 1200,
      });
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Hata",
        detail: "Commitler alınamadı",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };
  // ServiceNow verisini backend proxy ile CORS'suz çek

  const dateBodyTemplate = (rowData) => {
    if (!rowData.date) return "";
    const date = new Date(rowData.date);
    if (isNaN(date.getTime())) return rowData.date;
    return date.toLocaleString("tr-TR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const filesBodyTemplate = (rowData) => {
    if (!rowData.files || !Array.isArray(rowData.files)) return "";
    const count = rowData.files.length;
    return (
      <span
        style={{
          color: "#1976d2",
          cursor: "pointer",
          textDecoration: "underline",
        }}
        onClick={() => {
          setModalFiles(rowData.files);
          setModalFilesPage(0);
          setFilesModalVisible(true);
        }}
        title="Dosya detaylarını görüntüle"
      >
        {count} dosya
      </span>
    );
  };

  const renderFilesModal = () => {
    const start = modalFilesPage * modalFilesRows;
    const end = start + modalFilesRows;
    const filesToShow = modalFiles.slice(start, end);
    return (
      <Dialog
        header="Commit Dosyaları"
        visible={filesModalVisible}
        style={{ width: "50vw", minWidth: 350 }}
        onHide={() => setFilesModalVisible(false)}
        footer={null}
        modal
      >
        <ul style={{ paddingLeft: 20 }}>
          {filesToShow.map((file, idx) => {
            let label = "";
            if (typeof file === "string") label = file;
            else if (file && typeof file === "object")
              label =
                file.filename ||
                file.new_path ||
                file.name ||
                file.path ||
                JSON.stringify(file);
            else label = String(file);
            return (
              <li key={start + idx} style={{ marginBottom: 8 }}>
                <span style={{ fontWeight: 500 }}>{label}</span>
                {file && typeof file === "object" && (
                  <>
                    {file.status && (
                      <Tag
                        value={file.status}
                        severity={
                          file.status === "added"
                            ? "success"
                            : file.status === "deleted"
                            ? "danger"
                            : "info"
                        }
                        style={{ marginLeft: 8 }}
                      />
                    )}
                    {file.diff && (
                      <pre
                        style={{
                          background: "#f4f4f4",
                          padding: 8,
                          borderRadius: 4,
                          marginTop: 4,
                          maxHeight: 120,
                          overflow: "auto",
                        }}
                      >
                        {file.diff}
                      </pre>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>
        <Paginator
          first={modalFilesPage * modalFilesRows}
          rows={modalFilesRows}
          totalRecords={modalFiles.length}
          onPageChange={(e) => {
            setModalFilesPage(e.page);
            setModalFilesRows(e.rows);
          }}
          rowsPerPageOptions={[5, 10, 20, 50]}
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        />
      </Dialog>
    );
  };

  return (
    <div className="p-m-4" style={{ maxWidth: 1400, margin: "0 auto" }}>
      <Toast ref={toast} position="top-right" />

      <Toolbar
        left={
          <Button
            label="Commitleri Yükle"
            icon="pi pi-gitlab"
            className="p-button-success"
            onClick={() => loadCommits({ ...lazyParams, first: 0, page: 0 })}
            loading={loading}
          />
        }
        right={
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              type="search"
              onInput={(e) => setGlobalFilter(e.target.value)}
              placeholder="Commitlerde ara..."
              value={globalFilter}
              style={{ width: 250 }}
            />
          </span>
        }
        style={{ marginBottom: 20 }}
      />
      <DataTable
        value={commits}
        lazy
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={totalRecords}
        onPage={(e) => {
          setLazyParams(e);
          loadCommits(e);
        }}
        rowsPerPageOptions={[5, 10, 20, 50]}
        showGridlines
        sortMode="multiple"
        removableSort
        className="p-datatable-striped p-datatable-gridlines p-datatable-sm"
        emptyMessage="Commit bulunamadı."
        loading={loading}
        scrollable
        scrollHeight="70vh"
        responsiveLayout="scroll"
        dataKey="sha"
        style={{ fontSize: 15 }}
      >
        <Column
          field="author"
          header="Yazar"
          sortable
          style={{ minWidth: 140 }}
        />
        <Column
          field="repoName"
          header="Repository"
          sortable
          style={{ minWidth: 180 }}
        />
        <Column
          field="message"
          header="Commit Mesajı"
          sortable
          style={{ minWidth: 300 }}
          body={(rowData) => (
            <span title={rowData.message} style={{ whiteSpace: "pre-line" }}>
              {rowData.message}
            </span>
          )}
        />
        <Column
          field="files"
          header="Dosyalar"
          style={{ minWidth: 180 }}
          body={filesBodyTemplate}
        />
        <Column
          field="date"
          header="Tarih"
          sortable
          dataType="date"
          style={{ minWidth: 180 }}
          body={dateBodyTemplate}
        />
      </DataTable>
      {renderFilesModal()}
    </div>
  );
}

export default GitLabList;