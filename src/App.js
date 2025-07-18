import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import GitLabList from './page/GitLabList';
import SnowList from './page/SnowList';

 function App() {
   return (
     <BrowserRouter>
       <Routes>
         <Route path="/">
           <Route path="gitlab" element={<GitLabList />} />
           <Route path="snow" element={<SnowList />} />
         </Route>
       </Routes>
     </BrowserRouter>
   );
 }
export default App;