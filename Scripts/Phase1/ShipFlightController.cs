using UnityEngine;

namespace Starfall.Phase1
{
    [RequireComponent(typeof(Rigidbody))]
    public sealed class ShipFlightController : MonoBehaviour
    {
        [Header("Flight")]
        [SerializeField] float acceleration = 35f;
        [SerializeField] float reverseAcceleration = 18f;
        [SerializeField] float maxSpeed = 160f;
        [SerializeField] float boostMultiplier = 2f;
        [SerializeField] float boostEnergy = 100f;
        [SerializeField] float boostDrain = 28f;
        [SerializeField] float boostRecharge = 16f;
        [SerializeField] float pitchRate = 80f;
        [SerializeField] float yawRate = 90f;
        [SerializeField] float rollRate = 110f;
        [SerializeField] float rotationDamping = 5f;
        Rigidbody body;
        float energy;

        public float Speed => body == null ? 0f : body.velocity.magnitude;
        public float BoostNormalized => boostEnergy <= 0f ? 0f : energy / boostEnergy;

        void Awake() { body = GetComponent<Rigidbody>(); body.useGravity = false; body.drag = 0.15f; body.angularDrag = 3f; energy = boostEnergy; }

        void FixedUpdate()
        {
            float thrust = Input.GetAxisRaw("Vertical");
            bool boosting = Input.GetKey(KeyCode.LeftShift) && thrust > 0f && energy > 0f;
            float force = thrust >= 0f ? acceleration : reverseAcceleration;
            if (boosting) { force *= boostMultiplier; energy = Mathf.Max(0f, energy - boostDrain * Time.fixedDeltaTime); }
            else energy = Mathf.Min(boostEnergy, energy + boostRecharge * Time.fixedDeltaTime);
            body.AddForce(transform.forward * thrust * force, ForceMode.Acceleration);
            if (body.velocity.magnitude > maxSpeed * (boosting ? boostMultiplier : 1f)) body.velocity = body.velocity.normalized * maxSpeed * (boosting ? boostMultiplier : 1f);
            float pitch = -Input.GetAxis("Mouse Y") * pitchRate;
            float yaw = Input.GetAxis("Mouse X") * yawRate + Input.GetAxisRaw("Horizontal") * yawRate * 0.35f;
            float roll = (Input.GetKey(KeyCode.Q) ? 1f : 0f) - (Input.GetKey(KeyCode.E) ? 1f : 0f);
            transform.Rotate(new Vector3(pitch, yaw, roll * rollRate) * Time.fixedDeltaTime, Space.Self);
            if (Input.GetKey(KeyCode.Space)) body.velocity = Vector3.Lerp(body.velocity, Vector3.zero, 4f * Time.fixedDeltaTime);
            body.angularVelocity = Vector3.Lerp(body.angularVelocity, Vector3.zero, rotationDamping * Time.fixedDeltaTime);
        }
    }
}
