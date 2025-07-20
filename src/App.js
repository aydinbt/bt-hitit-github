import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import GitLabList from './page/GitLabList';
import SnowList from './page/SnowList';
import JenkinsList from './page/JenkinsList';

 function App() {
   return (
     <BrowserRouter>
       <Routes>
         <Route path="/">
           <Route path="gitlab" element={<GitLabList />} />
           <Route path="snow" element={<SnowList />} />
           <Route path="jenkins" element={<JenkinsList />} />
         </Route>
       </Routes>
     </BrowserRouter>
   );
 }
export default App;