using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using System.Text;

public class StatsManager : MonoBehaviour
{
    private const string API_URL = "http://localhost:3000/api/unity/stats";

    // Estructura para las estadísticas
    [System.Serializable]
    public class PlayerStats
    {
        public int blocksDestroyed;
        public int bombsPlaced;
        public int gamesPlayed;
    }

    // Estructura para el payload completo
    [System.Serializable]
    public class StatsPayload
    {
        public string player;
        public PlayerStats stats;
    }

    // Método para enviar estadísticas al servidor
    public void SendStats(string playerName, int blocksDestroyed, int bombsPlaced, int gamesPlayed)
    {
        if (AuthManager.Instance.IsAuthenticated())
        {
            StartCoroutine(SendStatsCoroutine(playerName, blocksDestroyed, bombsPlaced, gamesPlayed));
        }
        else
        {
            Debug.LogWarning("Usuario no autenticado. Las estadísticas no se enviarán.");
        }
    }

    private IEnumerator SendStatsCoroutine(string playerName, int blocksDestroyed, int bombsPlaced, int gamesPlayed)
    {
        // Crear el payload
        var payload = new StatsPayload
        {
            player = playerName,
            stats = new PlayerStats
            {
                blocksDestroyed = blocksDestroyed,
                bombsPlaced = bombsPlaced,
                gamesPlayed = gamesPlayed
            }
        };

        // Convertir a JSON
        string jsonData = JsonUtility.ToJson(payload);
        byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonData);

        // Crear la petición
        using (UnityWebRequest www = new UnityWebRequest(API_URL, "POST"))
        {
            www.uploadHandler = new UploadHandlerRaw(bodyRaw);
            www.downloadHandler = new DownloadHandlerBuffer();
            www.SetRequestHeader("Content-Type", "application/json");
            
            // Añadir el token de autenticación
            string token = AuthManager.Instance.Token;
            if (!string.IsNullOrEmpty(token))
            {
                www.SetRequestHeader("Authorization", $"Bearer {token}");
            }

            // Enviar la petición
            yield return www.SendWebRequest();

            if (www.result == UnityWebRequest.Result.Success)
            {
                Debug.Log("Estadísticas enviadas correctamente: " + www.downloadHandler.text);
            }
            else
            {
                Debug.LogError("Error enviando estadísticas: " + www.error);
            }
        }
    }

    // Ejemplo de uso desde otro script:
    public void UpdatePlayerStats(string playerName)
    {
        // Estos valores deberían venir de tu lógica del juego
        SendStats(playerName, 10, 5, 1);
    }
}
