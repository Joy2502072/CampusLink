import React from "react";

export default function RiskSummaryCards({ students }) {

  const highRisk = students.filter(
    s => s.riskLevel === "High Risk"
  ).length;


  const mediumRisk = students.filter(
    s => s.riskLevel === "Medium Risk"
  ).length;


  const lowRisk = students.filter(
    s => s.riskLevel === "Low Risk"
  ).length;


  return (

    <div
      style={{
        display:"grid",
        gridTemplateColumns:"repeat(4,1fr)",
        gap:"16px"
      }}
    >

      <Card
        title="HIGH RISK STUDENTS"
        value={highRisk}
        subtitle="Immediate focus"
      />


      <Card
        title="MEDIUM RISK STUDENTS"
        value={mediumRisk}
        subtitle="Targeted coaching"
      />


      <Card
        title="LOW RISK STUDENTS"
        value={lowRisk}
        subtitle="Placement tracking"
      />


      <Card
        title="STUDENTS NEEDING INTERVENTION"
        value={students.length}
        subtitle="Mentor escalation"
      />


    </div>

  );

}



function Card({title,value,subtitle}){

return (

<div
style={{
background:"#1e293b",
padding:"20px",
borderRadius:"12px"
}}
>

<h4
style={{
color:"#94a3b8",
fontSize:"12px"
}}
>
{title}
</h4>


<h1
style={{
color:"#fff"
}}
>
{value}
</h1>


<p
style={{
color:"#64748b"
}}
>
{subtitle}
</p>


</div>

)

}