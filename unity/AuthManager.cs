using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using System.Text;
using UnityEngine.Events;

[System.Serializable]
public class AuthResponse
{
    public string message;
    public string token;
    public UserData user;
}

[System.Serializable]
public class UserData
{
    public string id;
    public string username;
    public string nom;
}

public class AuthManager : MonoBehaviour
{
    private const string API_BASE_URL = "http://localhost:3000/api/auth";
    public static AuthManager Instance { get; private set; }
    
    public string Token { get; private set; }
    public UserData CurrentUser { get; private set; }
    
    public UnityEvent<bool> OnAuthenticationComplete = new UnityEvent<bool>();

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }

    public void Login(string username, string password)
    {
        StartCoroutine(LoginCoroutine(username, password));
    }

    public void Register(string username, string password, string nom)
    {
        StartCoroutine(RegisterCoroutine(username, password, nom));
    }

    private IEnumerator LoginCoroutine(string username, string password)
    {
        var loginData = new { username = username, password = password };
        string jsonData = JsonUtility.ToJson(loginData);
        byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonData);

        using (UnityWebRequest www = new UnityWebRequest($"{API_BASE_URL}/login", "POST"))
        {
            www.uploadHandler = new UploadHandlerRaw(bodyRaw);
            www.downloadHandler = new DownloadHandlerBuffer();
            www.SetRequestHeader("Content-Type", "application/json");

            yield return www.SendWebRequest();

            if (www.result == UnityWebRequest.Result.Success)
            {
                AuthResponse response = JsonUtility.FromJson<AuthResponse>(www.downloadHandler.text);
                Token = response.token;
                CurrentUser = response.user;
                OnAuthenticationComplete.Invoke(true);
                Debug.Log($"Login exitoso: {response.message}");
            }
            else
            {
                OnAuthenticationComplete.Invoke(false);
                Debug.LogError($"Error en login: {www.error}");
            }
        }
    }

    private IEnumerator RegisterCoroutine(string username, string password, string nom)
    {
        var registerData = new { username = username, password = password, nom = nom };
        string jsonData = JsonUtility.ToJson(registerData);
        byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonData);

        using (UnityWebRequest www = new UnityWebRequest($"{API_BASE_URL}/register", "POST"))
        {
            www.uploadHandler = new UploadHandlerRaw(bodyRaw);
            www.downloadHandler = new DownloadHandlerBuffer();
            www.SetRequestHeader("Content-Type", "application/json");

            yield return www.SendWebRequest();

            if (www.result == UnityWebRequest.Result.Success)
            {
                AuthResponse response = JsonUtility.FromJson<AuthResponse>(www.downloadHandler.text);
                Token = response.token;
                CurrentUser = response.user;
                OnAuthenticationComplete.Invoke(true);
                Debug.Log($"Registro exitoso: {response.message}");
            }
            else
            {
                OnAuthenticationComplete.Invoke(false);
                Debug.LogError($"Error en registro: {www.error}");
            }
        }
    }

    // Método para verificar si el usuario está autenticado
    public bool IsAuthenticated()
    {
        return !string.IsNullOrEmpty(Token);
    }

    // Método para cerrar sesión
    public void Logout()
    {
        Token = null;
        CurrentUser = null;
        OnAuthenticationComplete.Invoke(false);
    }
}
