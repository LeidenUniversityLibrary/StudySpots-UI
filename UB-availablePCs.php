<?php
error_reporting(0);

$doc = new DOMDocument();
$doc->loadHTMLFile("http://lampje.leidenuniv.nl/vrijeterminals/?location=ub");

$xpath = new DOMXpath($doc);

// Find PC elements
$elements = $xpath->query("//*[contains(@class, 'pc')]");

// Collect PC ids
$pcs = [];
if (!is_null($elements)) {
  foreach ($elements as $element) {
    $pcs[]=$element->getAttribute("id");
  }
}

// Get availability
$availability = simplexml_load_file('http://lampje.leidenuniv.nl/vrijeterminals/get_locationinfo.php?location=Universiteitsbibliotheek%20%5B1169%5D');
$loggedOn = $availability->xpath("//StudentComputersavailability[LoggedOn='0']/Computername");
// Collect PC ids
$loggedOnPcs = [];
if (!is_null($loggedOn)) {
  foreach ($loggedOn as $element) {
    $loggedOnPcs[]=$element->__toString();
  }
}

// Calculate current availability
$pcsAvailable = count(array_intersect($pcs, $loggedOnPcs));

echo json_encode([
  "total" => count($pcs),
  "available" => $pcsAvailable
]);
 ?>
