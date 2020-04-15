package io.unthrottled.sogos.tacmod.pomodoro

import okhttp3.*
import java.io.BufferedReader
import java.io.IOException
import java.security.SecureRandom
import java.security.cert.X509Certificate
import javax.net.ssl.*

object APIService {
  private val client: OkHttpClient = OkHttpClient()

  fun performRequest(
      request: Request,
      callbutt: (response: String) -> Unit,
      error: (e: Throwable) -> Unit
  ) {
    client.newCall(request).enqueue(object : Callback {
      override fun onFailure(call: Call, e: IOException) {
        error(e)
      }

      override fun onResponse(call: Call, response: Response) {
        response.use { res ->
          if (res.isSuccessful) {
            res.body()?.charStream()?.use {
              try {
                val reader = BufferedReader(it)
                val stringBuilder = StringBuilder()
                var line: String? = reader.readLine()
                while (line != null) {
                  stringBuilder.append(line)
                  line = reader.readLine()
                }
                callbutt(stringBuilder.toString())
              } catch (e: Throwable) {
                error(e)
              }
            }
          } else {
            error(
                RuntimeException(
                    "Shit did not work, returned ${res.code()}"
                )
            )
          }
        }
      }
    })
  }
}