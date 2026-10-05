using System.Collections.Concurrent;

namespace TripMapper.Services
{
    public class PresenceTracker
    {
        // Keep every connection so one tab closing does not mark other tabs offline.
        private readonly ConcurrentDictionary<int, HashSet<string>> _connections = new();

        public bool UserConnected(int userId, string connectionId)
        {
            var connections = _connections.GetOrAdd(userId, _ => new HashSet<string>());
            lock (connections)
            {
                var wasOffline = connections.Count == 0;
                connections.Add(connectionId);
                return wasOffline;
            }
        }

        public bool UserDisconnected(int userId, string connectionId)
        {
            if (!_connections.TryGetValue(userId, out var connections)) return false;

            lock (connections)
            {
                connections.Remove(connectionId);
                if (connections.Count > 0) return false;
                _connections.TryRemove(userId, out _);
                return true;
            }
        }

        public bool IsOnline(int userId) => _connections.ContainsKey(userId);

        public IReadOnlyCollection<int> GetOnlineUserIds(IEnumerable<int> userIds)
            => userIds.Where(IsOnline).ToArray();
    }
}