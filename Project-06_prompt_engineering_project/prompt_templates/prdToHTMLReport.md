Generate an HTML report that visualizes the test coverage.

HTML FORMAT:

<!DOCTYPE html>
<html>
<head>
<title>Test Matrix Report</title>
<style>
body {
  font-family: Arial;
}
table {
  border-collapse: collapse;
  width: 100%;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
}
th {
  background-color: #f2f2f2;
}
.summary {
  background-color: #eef;
  padding: 10px;
  margin-bottom: 20px;
}
</style>
</head>

<body>

<h1>Test Coverage Report</h1>

<div class="summary">
<h2>Test Case Summary</h2>
<p>Total Test Cases Generated: X</p>
<p>Functional: X</p>
<p>Negative: X</p>
<p>Boundary: X</p>
<p>Edge Cases: X</p>
</div>

<h2>Test Case Matrix</h2>

<table>
<tr>
<th>TID</th>
<th>Category</th>
<th>Description</th>
<th>Priority</th>
</tr>

<!-- Generated Rows -->

</table>

<h2>Requirement Traceability Matrix</h2>

<table>
<tr>
<th>Requirement</th>
<th>Covered Test Cases</th>
</tr>

<!-- Generated Rows -->

</table>

</body>
</html>

---

PRD: <<< [PASTE PRD HERE] >>>

---