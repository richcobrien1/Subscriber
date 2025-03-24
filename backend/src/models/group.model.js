// models/group.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

console.log('Defining Group schema...');

const GroupSchema = new Schema({
  group_name: {
    type: String,
    required: true,
    trim: true
  },
  group_description: {
    type: String,
    trim: true
  },
  owner_id: {
    type: String,
    required: true
  },
  avatar_url: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  privacy_level: {
    type: String,
    enum: ['public', 'private', 'secret'],
    default: 'private'
  },
  max_members: {
    type: Number,
    default: 50
  },
  settings: {
    join_approval_required: {
      type: Boolean,
      default: true
    },
    members_can_invite: {
      type: Boolean,
      default: true
    },
    location_sharing_required: {
      type: Boolean,
      default: true
    },
    music_sharing_enabled: {
      type: Boolean,
      default: true
    },
    proximity_alert_distance: {
      type: Number,
      default: 100
    },
    default_mute_on_join: {
      type: Boolean,
      default: false
    }
  },
  group_members: [{
    user_id: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member'
    },
    joined_at: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'muted'],
      default: 'active'
    },
    nickname: {
      type: String
    },
    last_active: {
      type: Date
    }
  }],
  invitations: [{
    email: {
      type: String,
      required: true
    },
    invited_by: {
      type: String,
      required: true
    },
    invited_at: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'expired'],
      default: 'pending'
    },
    expires_at: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  }]
}, {
  collection: 'groups', // Explicitly set collection name
  timestamps: true
});

// Add methods
GroupSchema.methods.isMember = function(user_id) {
  return this.group_members.some(member => member.user_id === user_id);
};

GroupSchema.methods.isAdmin = function(user_id) {
  const member = this.group_members.find(member => member.user_id === user_id);
  return member && (member.role === 'admin' || member.role === 'owner');
};

GroupSchema.methods.isOwner = function(user_id) {
  return this.owner_id === user_id;
};

GroupSchema.methods.addMember = function(user_id, role = 'member') {
  if (!this.isMember(user_id)) {
    this.group_members.push({
      user_id: user_id,
      role,
      joined_at: new Date(),
      status: 'active'
    });
  }
  return this;
};

GroupSchema.methods.removeMember = function(user_id) {
  this.group_members = this.group_members.filter(member => member.user_id !== user_id);
  return this;
};

console.log('Creating Group model...');
const Group = mongoose.model('Group', GroupSchema);
console.log('Group model created successfully');

module.exports = Group;
