const qs = require("qs");

function getAdminToken() {
  return fetch(
    "http://192.168.0.84:5050/auth/realms/qeng/protocol/openid-connect/token",
    {
      credentials: "include",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      method: "POST",
      body: qs.stringify({
        client_id: "admin-cli",
        client_secret: "KM6XGzMept27q94Rmv3WlMIuLPt61srK",
        grant_type: "client_credentials",
      }),
    }
  );
}

function getUsername(token, username) {
  return fetch(
    "http://192.168.0.84:5050/auth/admin/realms/qeng/users?username=" +
      username,
    {
      credentials: "include",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        authorization: "Bearer " + token,
      },
      method: "GET",
    }
  );
}

function impersonateUser(token, userId) {
  return fetch(
    "http://192.168.0.84:5050/auth/admin/realms/qeng/users/" +
      userId +
      "/impersonation",
    {
      credentials: "include",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        authorization: "Bearer " + token,
      },
      method: "POST",
    }
  );
}

function tokenBasedAuth(token, cookie, user) {
  const query = qs.stringify({
    response_mode: "fragment",
    response_type: "token",
    client_id: "admin-cli",
    redirect_uri: "http://localhost:8000",
  });

  return fetch(
    "http://192.168.0.84:5050/auth/realms/qeng/protocol/openid-connect/auth?" +
      query,
    {
      cookie,
      credentials: "include",
      redirect: 'manual',
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        authorization: "Bearer " + token,
      },
      method: "GET",
    }
  );
}

async function test() {
  try {
    /* Get token */
    let res = await getAdminToken();
    res = await res.json();
    const { access_token: token } = res;

    /* Get user data */
    res = await getUsername(token, "4324182061");
    res = await res.json();
    const { id: userId } = res[0];

    /* Impersonate */
    res = await impersonateUser(token, userId);
    const cookie = res.headers["set-cookie"];
    res = await res.json();

    /* Get auth token */
    res = await tokenBasedAuth(token, cookie, res);
    console.log(res)
    res = await res.text();
    console.log(res)
  } catch (err) {
    console.error(err);
  }
}

test().then(console.log).catch(console.error);
