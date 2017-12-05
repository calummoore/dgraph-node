// @noflow
import grpc from 'grpc'
import path from 'path'

const p1 = grpc.load(path.join(__dirname, '/../protos/api.proto'))
export default { ...p1.api }
