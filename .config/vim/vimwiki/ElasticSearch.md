# ElasticSearch Snippets

[[###]] Put Data on Elastic with cURL
`curl -XPUT 'localhost:9200/companydatabase?pretty' -H 'Content-Type: application/json' -d' {"mappings" : { "employees" : { "properties" : { "FirstName" : { "type" : "text" }, "LastName" : { "type" : "text" }, "Designation" : { "type" : "text" }, "Salary" : { "type" : "integer" }, "DateOfJoining" : { "type" : "date", "format": "yyyy-MM-dd" }, "Address" : { "type" : "text" }, "Gender" : { "type" : "text" }, "Age" : { "type" : "integer" }, "MaritalStatus" : { "type" : "text" }, "Interests" : { "type" : "text" }}}}}'` 
`curl -XPUT 'localhost:9200/companydatabase/_bulk' --data-binary @Employees50K.json`
