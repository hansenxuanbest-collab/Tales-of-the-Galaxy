using UnityEngine;

namespace Starfall.Phase1
{
    public sealed class ChaseCamera : MonoBehaviour
    {
        [SerializeField] Transform target;
        [SerializeField] Vector3 localOffset = new Vector3(0f, 4f, -12f);
        [SerializeField] float positionSharpness = 8f;
        [SerializeField] float lookSharpness = 10f;
        void LateUpdate()
        {
            if (!target) return;
            Vector3 desired = target.TransformPoint(localOffset);
            transform.position = Vector3.Lerp(transform.position, desired, 1f - Mathf.Exp(-positionSharpness * Time.deltaTime));
            Quaternion desiredRotation = Quaternion.LookRotation(target.position + target.forward * 20f - transform.position, target.up);
            transform.rotation = Quaternion.Slerp(transform.rotation, desiredRotation, 1f - Mathf.Exp(-lookSharpness * Time.deltaTime));
        }
    }
}
