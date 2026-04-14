import { getOssUploadPolicyApi, type OssPolicy } from '@/api/article'

/**
 * 生成随机文件名
 */
const generateFileName = (file: File) => {
  const suffix = file.name.split('.').pop() || 'png'
  const timestamp = new Date().getTime()
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `${timestamp}_${randomStr}.${suffix}`
}

/**
 * 上传文件到 OSS
 * @param file 待上传的文件对象
 * @returns Promise<string> 返回文件的完整访问地址
 */
export const uploadToOss = async (file: File): Promise<string> => {
  try {
    // 1. 获取签名
    const res = await getOssUploadPolicyApi()
    
    // 根据 request.ts 的封装，后端返回的是 { code: xxx, msg: xxx, data: { accessid, ... } }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const policy = (res as any).data?.data || (res as any).data

    if (!policy || !policy.host || !policy.signature) {
      throw new Error('获取 OSS 凭证失败或格式不正确')
    }

    // 2. 构造 FormData
    const formData = new FormData()
    const fileName = generateFileName(file)
    const key = `${policy.dir}${policy.dir.endsWith('/') ? '' : '/'}${fileName}`

    formData.append('key', key)
    formData.append('policy', policy.policy)
    formData.append('OSSAccessKeyId', policy.accessid)
    formData.append('signature', policy.signature)
    formData.append('success_action_status', '200')
    formData.append('file', file)

    // 清理 host 末尾的斜杠
    const host = policy.host.replace(/\/$/, '')

    // 3. 直传 OSS
    const response = await fetch(host, {
      method: 'POST',
      body: formData
    })

    if (response.ok) {
      return `${host}/${key}`
    } else {
      const errorText = await response.text()
      console.error('OSS 上传错误详情:', errorText)
      throw new Error(`上传失败: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    console.error('OSS 上传错误:', error)
    throw error
  }
}
