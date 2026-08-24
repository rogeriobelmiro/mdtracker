async function test() {
  const url = "https://evolution.mudadigital.net/instance/connectionState/MudaDigital";
  const key = "Khy6E6vuBA3pQlieJQVCwoJYdN6rAAX6";
  try {
    const res = await fetch(url, { headers: { "apikey": key } });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Body:", text);
  } catch(e) {
    console.error("Error:", e);
  }
}
test();
