import React, { useEffect, useState } from 'react';
import RiskSummaryCards from './RiskSummaryCards';
import RiskDistribution from './RiskDistribution';
import RiskStudentTable from './RiskStudentTable';
import StudentRiskDetails from './StudentRiskDetails';
import { Info, Sparkles, Download } from 'lucide-react';

export default function AtRiskStudents() {

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [loading, setLoading] = useState(true);


  // Fetch backend at-risk students
  useEffect(() => {

    const fetchAtRiskStudents = async () => {

      try {

        const response = await fetch(
          "http://localhost:5000/api/readiness/at-risk",
          {
            method: "GET",
            headers: {
              "X-Demo-User-Role": "placement_officer"
            }
          }
        );


        const result = await response.json();


        if (result.success) {
          setStudents(result.data.students);
        }
        else {
          console.error(result.message);
        }


      } catch (error) {

        console.error(
          "Error fetching at-risk students:",
          error
        );

      } finally {

        setLoading(false);

      }

    };


    fetchAtRiskStudents();

  }, []);



  const showToast = (msg) => {

    setToastMessage(msg);

    setTimeout(() => {
      setToastMessage(null);
    }, 4000);

  };



  if (loading) {

    return (
      <div
        style={{
          color:"#ffffff",
          padding:"30px",
          fontSize:"18px"
        }}
      >
        Loading at-risk students...
      </div>
    );

  }



  return (

    <div
      style={{
        display:'flex',
        flexDirection:'column',
        gap:'22px'
      }}
    >


      {/* Toast */}
      {toastMessage && (

        <div
          role="status"
          style={{
            position:'fixed',
            bottom:'24px',
            right:'24px',
            backgroundColor:'#1e293b',
            border:'1px solid var(--accent-blue)',
            color:'#fff',
            padding:'12px 18px',
            borderRadius:'8px',
            zIndex:70
          }}
        >

          {toastMessage}

        </div>

      )}





      {/* Info Banner */}

      <div
        style={{
          backgroundColor:'rgba(59,130,246,0.08)',
          border:'1px solid rgba(59,130,246,0.25)',
          borderRadius:'10px',
          padding:'10px 16px',
          display:'flex',
          alignItems:'center',
          gap:'10px'
        }}
      >

        <Info 
          size={16}
          color="var(--accent-blue)"
        />

        <p
          style={{
            fontSize:'0.76rem',
            color:'var(--text-secondary)'
          }}
        >

          <strong style={{color:'#fff'}}>
            Explainable readiness-based placement risk analysis.
          </strong>

        </p>


      </div>





      {/* Header */}

      <div
        style={{
          display:'flex',
          justifyContent:'space-between',
          alignItems:'center',
          flexWrap:'wrap'
        }}
      >

        <div>

          <h2
            style={{
              fontSize:'1.45rem',
              fontWeight:800,
              color:'#fff'
            }}
          >

            At-Risk Student Monitoring

          </h2>


          <p
            style={{
              color:'var(--text-secondary)',
              fontSize:'0.82rem'
            }}
          >

            Identify students requiring placement intervention.

          </p>


        </div>





        <div
          style={{
            display:'flex',
            gap:'10px'
          }}
        >


          <button
            onClick={() =>
              showToast(
                "Demo control: Report exported successfully"
              )
            }
            style={{
              display:'flex',
              alignItems:'center',
              gap:'6px',
              padding:'8px 12px',
              borderRadius:'8px',
              background:'var(--bg-card)',
              color:'#fff'
            }}
          >

            <Download size={14}/>
            Export List

          </button>





          <button
            onClick={() =>
              showToast(
                "Batch intervention triggered"
              )
            }
            style={{
              display:'flex',
              alignItems:'center',
              gap:'6px',
              padding:'8px 14px',
              borderRadius:'8px',
              background:'#2563eb',
              color:'#fff'
            }}
          >

            <Sparkles size={14}/>
            Trigger Intervention

          </button>


        </div>


      </div>






      {/* Components with Backend Data */}


      <RiskSummaryCards
        students={students}
      />



      <RiskDistribution
        students={students}
      />



      <RiskStudentTable

        students={students}

        onSelectStudent={(student)=>
          setSelectedStudent(student)
        }

      />






      {
        selectedStudent &&

        <StudentRiskDetails

          student={selectedStudent}

          onClose={() =>
            setSelectedStudent(null)
          }


          onActionTrigger={(msg)=>{

            showToast(msg);

            setSelectedStudent(null);

          }}

        />

      }



    </div>

  );

}