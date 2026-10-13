using UnityEngine;
using UnityEngine.UI;

namespace Starfall.Phase1
{
    public sealed class FlightHud : MonoBehaviour
    {
        [SerializeField] ShipFlightController ship;
        [SerializeField] Text speedText;
        [SerializeField] Image boostFill;
        void Update()
        {
            if (!ship) return;
            if (speedText) speedText.text = $"SPD {ship.Speed:000}";
            if (boostFill) boostFill.fillAmount = ship.BoostNormalized;
        }
    }
}
